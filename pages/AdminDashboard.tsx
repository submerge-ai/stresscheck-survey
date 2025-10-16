import React, { useState, useEffect } from 'react';
import { User, Role, Questionnaire, AISettings, Question } from '../types';
import { api } from '../services/mockApi';
import { STRESS_CHECK_QUESTIONS, AI_PERSONA_OPTIONS } from '../constants';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import { Plus, Trash2 } from 'lucide-react';

const AdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState('accounts');
    const [users, setUsers] = useState<User[]>([]);
    const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
    const [aiSettings, setAiSettings] = useState<AISettings>({ persona: '', customPrompt: '', logoUrl: '' });
    const [loading, setLoading] = useState(true);
    const [showSaveMessage, setShowSaveMessage] = useState(false);

    const [newUser, setNewUser] = useState({ name: '', role: Role.USER, password: '' });

    const [newQuestionnaire, setNewQuestionnaire] = useState({ name: '', description: '', questionIds: [] as number[] });
    const [isCreatingQ, setIsCreatingQ] = useState(false);


    const fetchData = async () => {
        setLoading(true);
        try {
            const [usersData, questionnairesData, aiSettingsData] = await Promise.all([
                api.getUsers(),
                api.getQuestionnaires(),
                api.getAiSettings(),
            ]);
            setUsers(usersData);
            setQuestionnaires(questionnairesData);
            setAiSettings(aiSettingsData);
        } catch (error) {
            console.error("Failed to load admin data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUser.name || !newUser.password) {
            alert('名前とパスワードを入力してください。');
            return;
        }
        await api.createUser(newUser);
        setNewUser({ name: '', role: Role.USER, password: '' });
        fetchData(); // Refresh list
    };

    const handleDeleteUser = async (userId: string) => {
        if (window.confirm('このユーザーを削除してもよろしいですか？')) {
            await api.deleteUser(userId);
            fetchData(); // Refresh list
        }
    };

    const handleSetActiveQuestionnaire = async (questionnaireId: string) => {
        const q = questionnaires.find(q => q.id === questionnaireId);
        if (q) {
            await api.updateQuestionnaire({ ...q, isActive: true });
            fetchData();
        }
    };

    const handleCreateQuestionnaire = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newQuestionnaire.name || newQuestionnaire.questionIds.length === 0) {
            alert('名前を入力し、少なくとも1つの質問を選択してください。');
            return;
        }
        await api.createQuestionnaire(newQuestionnaire);
        setNewQuestionnaire({ name: '', description: '', questionIds: [] });
        setIsCreatingQ(false);
        fetchData();
    };

    const handleDeleteQuestionnaire = async (id: string) => {
         if (window.confirm('この質問票を削除してもよろしいですか？デフォルトまたは有効な質問票は削除できません。')) {
            const success = await api.deleteQuestionnaire(id);
            if(success) {
                fetchData();
            } else {
                alert('削除できませんでした。デフォルトまたは有効な質問票は削除できません。');
            }
        }
    };
    
    const handleQuestionToggle = (qId: number) => {
        setNewQuestionnaire(prev => {
            const questionIds = prev.questionIds.includes(qId)
                ? prev.questionIds.filter(id => id !== qId)
                : [...prev.questionIds, qId];
            return { ...prev, questionIds };
        });
    };

    const handleAiSettingsChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'persona') {
            const selectedPersona = Object.values(AI_PERSONA_OPTIONS).find(p => p.persona === value);
            if (selectedPersona) {
                setAiSettings(prev => ({ ...prev, persona: selectedPersona.prompt, customPrompt: '' }));
            }
        } else {
            setAiSettings(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAiSettings(prev => ({ ...prev, logoUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleRemoveLogo = () => {
        setAiSettings(prev => ({ ...prev, logoUrl: ''}));
    }

    const handleSaveAiSettings = async () => {
        await api.saveAiSettings(aiSettings);
        setShowSaveMessage(true);
        setTimeout(() => {
            setShowSaveMessage(false);
            window.location.reload();
        }, 2000);
    };

    if (loading) return <Spinner />;

    const tabs = [
        { id: 'accounts', label: 'アカウント管理' },
        { id: 'questionnaires', label: '質問票管理' },
        { id: 'settings', label: 'システム設定' },
    ];
    
    return (
        <div className="container mx-auto space-y-8">
            <h1 className="text-3xl font-bold">管理者ダッシュボード</h1>

            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`${
                                activeTab === tab.id
                                    ? 'border-brand-base text-brand-dark'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>
            
            {showSaveMessage && (
                <div className="fixed top-5 right-5 bg-green-500 text-white py-2 px-4 rounded-lg shadow-lg z-50">
                    設定を保存しました。ページを更新します...
                </div>
            )}

            {activeTab === 'accounts' && (
                <Card title="ユーザーアカウント管理">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="font-semibold mb-4 text-lg">ユーザーリスト</h3>
                            <div className="h-96 overflow-y-auto border rounded-lg p-2 space-y-2">
                                {users.map(user => (
                                    <div key={user.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                                        <div>
                                            <p className="font-medium">{user.name} ({user.role})</p>
                                            <p className="text-sm text-gray-500">ID: {user.id}</p>
                                        </div>
                                        <button onClick={() => handleDeleteUser(user.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-full"><Trash2 size={18}/></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-4 text-lg">アカウントを新規作成する</h3>
                            <form onSubmit={handleCreateUser} className="space-y-4 p-4 border rounded-lg bg-gray-50">
                                <input type="text" placeholder="名前" value={newUser.name} onChange={e => setNewUser(p => ({ ...p, name: e.target.value }))} className="w-full p-2 border rounded-lg" />
                                <input type="password" placeholder="パスワード" value={newUser.password} onChange={e => setNewUser(p => ({ ...p, password: e.target.value }))} className="w-full p-2 border rounded-lg" />
                                <select value={newUser.role} onChange={e => setNewUser(p => ({ ...p, role: e.target.value as Role }))} className="w-full p-2 border rounded-lg bg-white">
                                    <option value={Role.USER}>利用者</option>
                                    <option value={Role.STAFF}>支援員</option>
                                    <option value={Role.ADMIN}>管理者</option>
                                </select>
                                <button type="submit" className="w-full p-2 bg-brand-base text-white rounded-lg hover:bg-brand-dark transition-colors">作成</button>
                            </form>
                        </div>
                    </div>
                </Card>
            )}

            {activeTab === 'questionnaires' && (
                 <Card title="質問票テンプレート管理">
                    <div className="space-y-4">
                        {questionnaires.map(q => (
                            <div key={q.id} className="flex justify-between items-center p-4 border rounded-lg">
                                <div>
                                    <p className="font-semibold">{q.name} {q.isDefault && <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full ml-2">Default</span>}</p>
                                    <p className="text-sm text-gray-500">{q.description}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                     {!q.isDefault && (
                                        <button onClick={() => handleDeleteQuestionnaire(q.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-full"><Trash2 size={18}/></button>
                                     )}
                                    {q.isActive ? (
                                        <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm font-medium">有効</span>
                                    ) : (
                                        <button onClick={() => handleSetActiveQuestionnaire(q.id)} className="px-3 py-1 bg-brand-light text-brand-darkest rounded-full text-sm hover:bg-brand-base hover:text-white transition-colors">有効にする</button>
                                    )}
                                </div>
                            </div>
                        ))}
                         <button onClick={() => setIsCreatingQ(!isCreatingQ)} className="mt-4 flex items-center space-x-2 p-2 bg-brand-base text-white rounded-lg hover:bg-brand-dark transition-colors">
                            <Plus size={20} />
                            <span>新しい質問票を作成</span>
                        </button>
                    </div>
                    {isCreatingQ && (
                        <div className="mt-6">
                            <h3 className="font-semibold mb-4 text-lg">新規質問票テンプレート</h3>
                            <form onSubmit={handleCreateQuestionnaire} className="space-y-4 p-4 border rounded-lg bg-gray-50">
                                <input type="text" placeholder="テンプレート名" value={newQuestionnaire.name} onChange={e => setNewQuestionnaire(p => ({...p, name: e.target.value}))} className="w-full p-2 border rounded-lg" />
                                <textarea placeholder="説明" value={newQuestionnaire.description} onChange={e => setNewQuestionnaire(p => ({...p, description: e.target.value}))} className="w-full p-2 border rounded-lg" rows={2}/>
                                <div className="h-64 overflow-y-auto border rounded-lg p-2 space-y-2 bg-white">
                                    <h4 className="font-semibold">質問を選択してください</h4>
                                    {STRESS_CHECK_QUESTIONS.map(q => (
                                        <label key={q.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-md">
                                            <input type="checkbox" checked={newQuestionnaire.questionIds.includes(q.id)} onChange={() => handleQuestionToggle(q.id)} className="rounded"/>
                                            <span>{q.id}. {q.text}</span>
                                        </label>
                                    ))}
                                </div>
                                <button type="submit" className="w-full p-2 bg-brand-base text-white rounded-lg hover:bg-brand-dark transition-colors">テンプレートを作成</button>
                            </form>
                        </div>
                    )}
                 </Card>
            )}

            {activeTab === 'settings' && (
                <Card title="AIおよびシステム設定">
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-semibold mb-2 text-lg">ロゴ設定</h3>
                            <div className="flex items-center space-x-4">
                               {aiSettings.logoUrl && <img src={aiSettings.logoUrl} alt="logo preview" className="h-12 border p-1 rounded-md bg-gray-100" />}
                               <input type="file" accept="image/*" onChange={handleLogoUpload} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-light file:text-brand-darkest hover:file:bg-brand-base hover:file:text-white" />
                               {aiSettings.logoUrl && <button onClick={handleRemoveLogo} className="p-2 text-red-500 hover:bg-red-100 rounded-full"><Trash2 size={18}/></button>}
                            </div>
                        </div>
                        <hr/>
                        <div>
                            <h3 className="font-semibold mb-2 text-lg">AI設定</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block font-semibold mb-1">AIペルソナ選択</label>
                                    <select name="persona" onChange={handleAiSettingsChange} value={Object.values(AI_PERSONA_OPTIONS).find(p => p.prompt === aiSettings.persona)?.persona || ''} className="w-full p-2 border rounded-lg bg-white">
                                       {Object.entries(AI_PERSONA_OPTIONS).map(([key, opt]) => <option key={key} value={opt.persona}>{opt.persona}</option>)}
                                    </select>
                                </div>
                                 <div>
                                    <label className="block font-semibold mb-1">システムプロンプト (選択したペルソナ)</label>
                                    <textarea rows={4} readOnly value={aiSettings.persona} className="w-full p-2 border rounded-lg bg-gray-100" />
                                </div>
                                <div>
                                    <label className="block font-semibold mb-1">カスタムプロンプト (上書き)</label>
                                    <textarea name="customPrompt" rows={4} value={aiSettings.customPrompt} onChange={handleAiSettingsChange} className="w-full p-2 border rounded-lg" placeholder="ここに入力すると、選択したペルソナのプロンプトが上書きされます。" />
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                           <button onClick={handleSaveAiSettings} className="px-6 py-2 bg-brand-base text-white rounded-lg hover:bg-brand-dark transition-colors">設定を保存</button>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default AdminDashboard;