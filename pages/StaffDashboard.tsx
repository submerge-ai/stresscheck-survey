import React, { useState, useEffect, useMemo, useRef } from 'react';
import { User, Result } from '../types';
import { api } from '../services/mockApi';
import { geminiService } from '../services/geminiService';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import StressLevelChart from '../components/StressLevelChart';
import { Download, Printer } from 'lucide-react';

const StaffDashboard: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [results, setResults] = useState<Result[]>([]);
    const [report, setReport] = useState<string>('');
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [loadingReport, setLoadingReport] = useState(false);
    const reportRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        api.getUsers().then(allUsers => {
            setUsers(allUsers.filter(u => u.role === 'USER'));
            setLoadingUsers(false);
        });
    }, []);

    const handleUserSelect = async (user: User) => {
        setSelectedUser(user);
        setLoadingDetails(true);
        setReport('');
        setResults([]);

        try {
            const userResults = await api.getResultsForUser(user.id);
            setResults(userResults);
            
            if (userResults.length > 0) {
                setLoadingReport(true);
                const generatedReport = await geminiService.generateStaffReport(user, userResults);
                setReport(generatedReport);
            } else {
                setReport('この利用者の結果はまだありません。');
            }
        } catch (error) {
            console.error("Failed to fetch user details or generate report", error);
            setReport('レポートの生成に失敗しました。');
        } finally {
            setLoadingDetails(false);
            setLoadingReport(false);
        }
    };
    
    const handleDownload = () => {
        if (!report || !selectedUser) return;
        const blob = new Blob([report], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report-${selectedUser.id}-${new Date().toISOString().split('T')[0]}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handlePrint = () => {
        if (!reportRef.current || !selectedUser) return;
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write('<html><head><title>レポート - ' + selectedUser.id + '</title>');
            printWindow.document.write('<style>body { font-family: sans-serif; white-space: pre-wrap; word-wrap: break-word; } h1, h2, h3 { margin-bottom: 0.5em; } </style>');
            printWindow.document.write('</head><body>');
            printWindow.document.write(reportRef.current.innerHTML.replace(/\n/g, '<br>'));
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.print();
        }
    };

    const latestResult = useMemo(() => results.length > 0 ? results[results.length - 1] : null, [results]);

    return (
        <div className="container mx-auto">
            <h1 className="text-3xl font-bold mb-6">支援員ダッシュボード</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <Card title="利用者一覧">
                        {loadingUsers ? <Spinner /> : (
                            <ul className="space-y-2 max-h-[70vh] overflow-y-auto">
                                {users.map(user => (
                                    <li key={user.id}>
                                        <button
                                            onClick={() => handleUserSelect(user)}
                                            className={`w-full text-left p-3 rounded-lg transition-colors ${selectedUser?.id === user.id ? 'bg-brand-dark text-white' : 'bg-gray-100 hover:bg-brand-light'}`}
                                        >
                                            {user.name} ({user.id})
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Card>
                </div>
                <div className="lg:col-span-2">
                    <Card>
                        {!selectedUser ? (
                            <div className="flex items-center justify-center h-96">
                                <p className="text-center text-gray-500">利用者を選択して詳細を表示します。</p>
                            </div>
                        ) : loadingDetails ? (
                            <Spinner />
                        ) : (
                            <div>
                                <h2 className="text-2xl font-semibold mb-4">{selectedUser.name}さんの詳細</h2>
                                
                                {results.length > 0 && latestResult && (
                                    <>
                                        <div className="mb-6">
                                            <h3 className="text-lg font-semibold mb-2">ストレスレベルの推移</h3>
                                            <StressLevelChart data={results} />
                                        </div>
                                    </>
                                )}

                                <div className="mb-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="text-lg font-semibold">AIによる分析レポート</h3>
                                        {!loadingReport && report && (
                                            <div className="flex space-x-2">
                                                <button onClick={handleDownload} className="p-2 rounded-full hover:bg-gray-200 transition-colors"><Download size={20} /></button>
                                                <button onClick={handlePrint} className="p-2 rounded-full hover:bg-gray-200 transition-colors"><Printer size={20} /></button>
                                            </div>
                                        )}
                                    </div>
                                    {loadingReport ? <Spinner /> : (
                                        <div ref={reportRef} className="p-4 bg-gray-50 rounded-lg border whitespace-pre-wrap font-mono text-sm max-h-96 overflow-y-auto">
                                            {report}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default StaffDashboard;