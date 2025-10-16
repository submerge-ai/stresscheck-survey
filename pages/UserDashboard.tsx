import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { Result } from '../types';
import { api } from '../services/mockApi';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import StressLevelChart from '../components/StressLevelChart';

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      api.getResultsForUser(user.id)
        .then(data => {
          setResults(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Failed to fetch results", err);
          setLoading(false);
        });
    }
  }, [user]);

  const latestResult = results.length > 0 ? results[results.length - 1] : null;

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">ダッシュボード</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <Card title="ストレスレベルの推移" className="printable-card">
                {loading ? <Spinner /> : results.length > 0 ? <StressLevelChart data={results} /> : <p>まだ結果がありません。</p>}
            </Card>
        </div>

        <div className="space-y-6">
            <Card className="no-print">
                <h3 className="text-xl font-semibold mb-4">新しいストレスチェック</h3>
                <p className="mb-4">現在の心の状態を確認してみましょう。</p>
                <button 
                    onClick={() => navigate('/stress-check')}
                    className="w-full bg-brand-base hover:bg-brand-dark text-white font-bold py-3 px-6 rounded-full transition-colors text-lg"
                >
                    ストレスチェックを開始
                </button>
            </Card>

            {latestResult && (
                 <Card title={`最新の結果 (${new Date(latestResult.date).toLocaleDateString()})`} className="printable-card">
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-gray-500">ストレスレベル</p>
                            <p className={`text-2xl font-bold ${latestResult.stressLevel === '高' ? 'text-red-500' : latestResult.stressLevel === '中' ? 'text-yellow-500' : 'text-green-500'}`}>{latestResult.stressLevel}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">スコア</p>
                            <p className="text-2xl font-bold text-gray-700">{latestResult.score} / {latestResult.maxScore}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">AIからのフィードバック</p>
                            <p className="p-3 bg-gray-100 rounded-md whitespace-pre-wrap">{latestResult.aiFeedback}</p>
                        </div>
                    </div>
                 </Card>
            )}
             <Card className="no-print">
                <button
                    onClick={() => window.print()}
                    className="w-full bg-white hover:bg-gray-100 text-brand-dark border border-brand-dark font-bold py-3 px-6 rounded-full transition-colors text-lg"
                >
                    結果を印刷
                </button>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;