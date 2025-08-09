import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/axios";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, ChartTitle, Tooltip, Legend);

interface StatsData {
  total_pastes: number;
  public_count: number;
  private_count: number;
  total_views: number;
  languages: { language: string; count: number }[];
}

const Stats = () => {
  const { user, loading } = useAuth();
  const [stats, setStats] = useState<StatsData | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      const { data } = await api.get("/stats");
      setStats(data);
    };
    fetchStats();
  }, [user]);

  if (!loading && !user) return <Navigate to="/login" replace />;

  const chartData = {
    labels: stats?.languages?.map((l) => l.language) || [],
    datasets: [
      {
        label: "Pastes",
        data: stats?.languages?.map((l) => l.count) || [],
        backgroundColor: "hsl(217.2 91.2% 59.8% / 0.5)",
        borderColor: "hsl(var(--ring))",
      },
    ],
  };

  return (
    <main className="container mx-auto py-8">
      <SEO title="Analytics | PasteFlow" description="View your PasteFlow analytics." />
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>

      {!stats && <p className="text-muted-foreground">Loading...</p>}

      {stats && (
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Total Pastes</div>
                <div className="text-2xl font-bold">{stats.total_pastes}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total Views</div>
                <div className="text-2xl font-bold">{stats.total_views}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Public</div>
                <div className="text-2xl font-bold">{stats.public_count}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Private</div>
                <div className="text-2xl font-bold">{stats.private_count}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Popular Languages</CardTitle>
            </CardHeader>
            <CardContent>
              <Bar data={chartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  );
};

export default Stats;
