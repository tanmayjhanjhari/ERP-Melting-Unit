import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

export default function ProfitChart({ data }) {
  return (
    <Line
      data={{
        labels: data.labels,
        datasets: [
          {
            label: "Profit",
            data: data.profit,
            borderColor: "#2563eb",
            backgroundColor: "#93c5fd",
          },
        ],
      }}
    />
  );
}
