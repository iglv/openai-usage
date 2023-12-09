import {useRef, useEffect, useState} from 'react';
import Chart from 'chart.js/auto';

export default function App() {
  const searchParams = new URLSearchParams(
    typeof window !== 'undefined' ? window.location.search : ''
  );

  const [apiKey, setApiKey] = useState(
    searchParams.get('apiKey') || localStorage.getItem('apiKey') || ''
  );
  const [organizationKey, setOrganizationKey] = useState(
    searchParams.get('organizationKey') || localStorage.getItem('organizationKey') || ''
  );
  const [startDate, setStartDate] = useState(searchParams.get('startDate') || '');
  const [endDate, setEndDate] = useState(searchParams.get('endDate') || '');

  const generateLink = () => {
    const params = new URLSearchParams();
    if (apiKey) params.set('apiKey', apiKey);
    if (organizationKey) params.set('organizationKey', organizationKey);
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);

    // Возвращает URL с параметрами
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  };

  const [error, setError] = useState(null);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  const priceModel = {
    input: {
      'gpt-3.5-turbo-16k-0613': 0.001,
      'gpt-3.5-turbo-0613': 0.001,
      'gpt-3.5-turbo-1106': 0.001,
      'gpt-3.5-turbo-instruct': 0.001,
      'text-embedding-ada-002-v2': 0.06,
      'gpt-4-0613': 0.03,
      'gpt-4-0314': 0.03,
      'gpt-4-1106-preview': 0.01,
      'gpt-4-1106-vision-preview': 0.01,
    },
    output: {
      'gpt-3.5-turbo-16k-0613': 0.002,
      'gpt-3.5-turbo-0613': 0.002,
      'gpt-3.5-turbo-1106': 0.002,
      'gpt-3.5-turbo-instruct': 0.002,
      'text-embedding-ada-002-v2': 0.06,
      'gpt-4-0613': 0.06,
      'gpt-4-0314': 0.06,
      'gpt-4-1106-preview': 0.03,
      'gpt-4-1106-vision-preview': 0.03,
    },
  };

  const [data, setData] = useState([]);

  const loadData = () => {
    if (!apiKey || !organizationKey || !startDate || !endDate) {
      setError('Please make sure all fields are filled correctly.');
      return;
    }

    setData([]);
    setIsLoading(true);

    if (!apiKey) return;
    if (!apiKey.match(/^sess-[a-zA-Z0-9]{40}$/)) {
      setError('Invalid API Key format. It should start with "sess-" and be 30 characters long.');
      return;
    }

    if (!organizationKey) return;
    if (!organizationKey.match(/^org-[a-zA-Z0-9]+$/)) {
      setError('Invalid Organization Key format. It should start with "org-".');
      return;
    }

    fetch(
      'https://api.openai.com/v1/dashboard/activity?start_date=' +
        startDate +
        '&end_date=' +
        endDate,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Openai-Organization': `${organizationKey}`,
        },
      }
    )
      .then((response) => {
        if (!response.ok) throw new Error('Failed to fetch data');
        return response.json();
      })
      .then((data) => {
        setData(data.data);
        setError(null);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setError(error.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // Установка даты начала и окончания на последние 30 дней
  useEffect(() => {
    if (!startDate || !endDate) {
      const today = new Date();
      const lastMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
      setStartDate(lastMonthDate.toISOString().split('T')[0]);
      setEndDate(today.toISOString().split('T')[0]);
    }
  }, [startDate, endDate]);
  // Обработка изменения apiKey

  useEffect(() => {
    localStorage.setItem('apiKey', apiKey);
  }, [apiKey]);

  // Обработка изменения apiKey
  useEffect(() => {
    localStorage.setItem('organizationKey', organizationKey);
  }, [organizationKey]);

  // Загрузка данных
  useEffect(() => {
    // load Data
    loadData();
  }, [apiKey, organizationKey, startDate, endDate]);

  const generateRandomColor = () => {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    return `rgba(${r}, ${g}, ${b}, 0.5)`;
  };

  const calculateCost = (item) => {
    return (
      priceModel.input[item.snapshot_id] * (item.n_context_tokens_total / 1000) +
      priceModel.output[item.snapshot_id] * (item.n_generated_tokens_total / 1000)
    );
  };

  const getGreenShade = (cost) => {
    const maxCost = 100;
    const opacity = Math.min(cost / maxCost, 1).toFixed(2);
    return `rgba(0, 255, 0, ${opacity})`;
  };

  const userCosts = data.reduce((acc, item) => {
    const cost = calculateCost(item);
    acc[item.user_id] = (acc[item.user_id] || 0) + cost;
    return acc;
  }, {});

  useEffect(() => {
    if (!chartRef.current) return;
    const ctx = chartRef.current.getContext('2d');

    // Group data by user_id

    const groupedData = data.reduce((acc, item) => {
      const cost = calculateCost(item); // Assuming you have a calculateCost function
      const userId = item.user_id;
      if (!acc[userId]) {
        acc[userId] = {
          costs: [],
          color: generateRandomColor(), // Assign a random color for each user
        };
      }
      acc[userId].costs.push(cost);
      return acc;
    }, {});

    // Create a dataset for each user
    const datasets = Object.keys(groupedData).map((userId) => ({
      label: userId,
      data: groupedData[userId].costs,
      backgroundColor: groupedData[userId].color,
      borderColor: groupedData[userId].color,
      borderWidth: 1,
    }));

    // Destroy the previous chart instance if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Create a new chart instance
    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map((item) =>
          new Date(item.aggregation_timestamp * 1000).toLocaleDateString()
        ),
        datasets: datasets,
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  return (
    <main className="min-h-screen p-24">
      <h1 className="text-3xl font-bold mb-5">OpenAI Usage Dashboard</h1>
      <p>
        This dashboard shows your OpenAI usage and costs. It uses the{' '}
        <a
          href="https://beta.openai.com/docs/api-reference/dashboard"
          target="_blank"
          rel="noopener noreferrer"
        >
          OpenAI Dashboard API
        </a>
        .
      </p>

      <div className="flex items-center mb-5 gap-5 mt-10">
        <div>
          <strong>Date Start:</strong>
          <br />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-gray-300 p-2"
          />
        </div>
        <div>
          <strong>Date End:</strong>
          <br />

          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border border-gray-300 p-2"
          />
        </div>
      </div>
      <div className="mb-5">
        <strong>Openai-Organization:</strong>
        <br />
        <div>
          <input
            type="text"
            placeholder="Enter your Organization Key here"
            value={organizationKey}
            onChange={(e) => setOrganizationKey(e.target.value)}
            className="border border-gray-300 p-2 w-[80%]"
          />
        </div>
        <div className="text-gray-500 text-sm mt-2">
          You can find your Organization Key in your account settings.
        </div>
      </div>
      <div className="mb-5">
        <strong>SESS Key:</strong>
        <br />
        <div className="flex items-center">
          <input
            type="text"
            placeholder="Enter your SESS-* API Key here"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="border border-gray-300 p-2 w-[80%]"
          />
          <button onClick={() => loadData()} className="ml-2 bg-blue-500 text-white p-2">
            Load Data
          </button>
        </div>
        <div className="text-gray-500 text-sm mt-2">
          You can find your SESS-* API Key in your browsers cookies after logging into OpenAI
          Playground. Or in the Network tab of the Developer Tools.
        </div>
      </div>
      <hr />

      {isLoading ? (
        <div>Loading data...</div> // Здесь может быть любой компонент лоадера
      ) : (
        <>
          {error && <p className="text-red-500">{error}</p>}

          {!error && data.length > 0 && (
            <>
              <div className="mt-5 mb-5 text-sm">
                Share Link: <br />
                {generateLink()}
              </div>

              <div style={{width: '600px', height: '400px'}}>
                <canvas ref={chartRef} />
              </div>

              <div className="mt-8 mb-5">
                <h2 className="text-lg font-bold">Total Costs by User</h2>
                <table className="table-auto border-collapse border border-slate-500 mt-4">
                  <thead>
                    <tr>
                      <th className="border border-slate-600 p-2">User ID</th>
                      <th className="border border-slate-600 p-2">Total Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(userCosts).map(([userId, totalCost], index) => (
                      <tr key={index} className="border border-slate-700">
                        <td className="border border-slate-600 p-2">{userId}</td>
                        <td className="border border-slate-600 p-2">${totalCost.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-8 mb-5">
                <h2 className="text-lg font-bold">Costs by Days</h2>
                <table className="table-auto border-collapse border border-slate-500">
                  <thead>
                    <tr>
                      <th className="border border-slate-600">Date</th>
                      <th className="border border-slate-600">Cost</th>
                      <th className="border border-slate-600">Snapshot ID</th>
                      <th className="border border-slate-600">User ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item, index) => {
                      const cost =
                        priceModel.input[item.snapshot_id] * (item.n_context_tokens_total / 1000) +
                        priceModel.output[item.snapshot_id] *
                          (item.n_generated_tokens_total / 1000);

                      return (
                        <tr key={index} className="border border-slate-700">
                          <td className="border border-slate-600 p-2">
                            {new Date(item.aggregation_timestamp * 1000).toLocaleDateString()}
                          </td>
                          <td
                            className="border border-slate-600 p-2"
                            style={{backgroundColor: getGreenShade(cost)}}
                          >
                            ${cost.toFixed(2)}
                          </td>
                          <td className="border border-slate-600 p-2">{item.snapshot_id}</td>
                          <td className="border border-slate-600 p-2">{item.user_id}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}
    </main>
  );
}
