# OpenAI Usage Dashboard

This interactive web application is designed to provide users with an insightful and easy-to-navigate interface to monitor and analyze their OpenAI API usage and costs. Utilizing the OpenAI Dashboard API, this dashboard offers a comprehensive view of API usage, helping users to track and manage their spending more effectively.

Demo Project: https://openai-stat.vercel.app/

## Key Features

- **API Key Integration:** Securely connect to the OpenAI API using your unique SESS Key and Organization Key.
- **Date Range Selection:** Customizable date range picker allowing users to filter data based on specific start and end dates.
- **Dynamic Data Visualization:** Utilizes Chart.js to render engaging and informative bar charts representing API usage and costs.
- **User-Centric Data:** Detailed breakdown of costs by user ID, offering insights into individual usage patterns.
- **Snapshot ID and Aggregation:** View data organized by Snapshot IDs and aggregation timestamps for precise tracking.
- **Error Handling:** Robust error handling to guide users through correct API key input and data fetching processes.
- **Responsive Design:** A user-friendly interface that adapts seamlessly across various devices and screen sizes.
- **Shareable Link Generation:** Generate custom URLs with encoded parameters for easy sharing of specific dashboard views.

## Technologies Used

- **React:** A JavaScript library for building user interfaces.
- **Chart.js:** A simple yet flexible JavaScript charting library.
- **CSS:** Styling and layout for a responsive design.

## Installation and Setup

To set up and run the OpenAI Usage Dashboard, follow these simple steps:

1. Clone the repository to your local machine.
2. Install the necessary dependencies by running `npm install` in the project directory.
3. Start the application with `npm start`. This will launch the dashboard in your default web browser.

## Usage

Upon launching the dashboard, you'll be prompted to enter your OpenAI SESS Key and Organization Key. These are essential for fetching your usage data from the OpenAI API. You can also select specific start and end dates to filter the data. Once the data is loaded, the dashboard will display a bar chart visualizing the costs incurred over the selected period. Additionally, detailed tables below the chart provide a breakdown of costs by user and by day.

## Contributing

Contributions to the OpenAI Usage Dashboard are welcome! Whether it's feature requests, bug reports, or code contributions, please feel free to open an issue or submit a pull request on our GitHub repository.

## License

This project is licensed under the MIT License - see the LICENSE file for details.