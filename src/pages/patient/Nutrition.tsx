import React, { useState } from 'react';
import {
    Utensils, Coffee, Apple, Award, ChevronRight, Plus,
    ChefHat, ShoppingCart, ArrowRight, Zap, RefreshCw, X, Check, Search
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { Button, Card, Badge, Input } from '../../components/ui';
import { generateMealPlan } from '../../services/geminiService';

const PatientNutrition: React.FC = () => {
    // State for AI Meal Planner
    const [generating, setGenerating] = useState(false);
    const [preferences, setPreferences] = useState({
        dietType: 'Balanced',
        calories: 2000,
        allergies: '',
        goal: 'Maintain Weight'
    });
    const [plan, setPlan] = useState<any>(null);

    // State for Meal Logging
    const [showLogModal, setShowLogModal] = useState(false);
    const [mealLog, setMealLog] = useState({
        name: '',
        calories: '',
        protein: '',
        carbs: '',
        fats: ''
    });

    // Mock Data for Charts (Dynamic)
    const [calorieData, setCalorieData] = useState([
        { name: 'Mon', calories: 2100 },
        { name: 'Tue', calories: 1850 },
        { name: 'Wed', calories: 2300 },
        { name: 'Thu', calories: 2150 },
        { name: 'Fri', calories: 1950 },
        { name: 'Sat', calories: 2400 },
        { name: 'Sun', calories: 2000 },
    ]);

    const [todayMacros, setTodayMacros] = useState({
        protein: 140,
        carbs: 250,
        fats: 65
    });

    const [loggedMeals, setLoggedMeals] = useState<{ id: number, name: string, calories: number, time: string }[]>([]);

    const macroData = [
        { name: 'Protein', value: todayMacros.protein, color: '#8884d8' },
        { name: 'Carbs', value: todayMacros.carbs, color: '#82ca9d' },
        { name: 'Fats', value: todayMacros.fats, color: '#ffc658' },
    ];

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            const result = await generateMealPlan(preferences);
            setPlan(result);
        } catch (error) {
            console.error("Failed to generate plan");
        } finally {
            setGenerating(false);
        }
    };

    const handleLogMeal = () => {
        if (!mealLog.name || !mealLog.calories) return;

        const newCalories = parseInt(mealLog.calories);
        const newProtein = parseInt(mealLog.protein) || 0;
        const newCarbs = parseInt(mealLog.carbs) || 0;
        const newFats = parseInt(mealLog.fats) || 0;

        // Update Today's Macros
        setTodayMacros(prev => ({
            protein: prev.protein + newProtein,
            carbs: prev.carbs + newCarbs,
            fats: prev.fats + newFats
        }));

        // Update Weekly Chart (Assuming "Sun" is today for demo)
        setCalorieData(prev => {
            const newData = [...prev];
            newData[6].calories += newCalories;
            return newData;
        });

        // Add to logged meals list
        setLoggedMeals(prev => [...prev, {
            id: Date.now(),
            name: mealLog.name,
            calories: newCalories,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);

        setShowLogModal(false);
        setMealLog({ name: '', calories: '', protein: '', carbs: '', fats: '' });
    };

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            {/* Log Meal Modal */}
            {showLogModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-slide-in">
                        <div className="px-6 py-4 border-b border-neutral-100 flex justify-between items-center bg-neutral-50">
                            <h3 className="font-bold text-neutral-900">Log a Meal</h3>
                            <button onClick={() => setShowLogModal(false)}><X className="h-5 w-5 text-neutral-400 hover:text-neutral-600" /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <Input
                                label="Meal Name"
                                placeholder="e.g. Grilled Chicken Salad"
                                value={mealLog.name}
                                onChange={e => setMealLog({ ...mealLog, name: e.target.value })}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Calories"
                                    type="number"
                                    placeholder="kcal"
                                    value={mealLog.calories}
                                    onChange={e => setMealLog({ ...mealLog, calories: e.target.value })}
                                />
                                <Input
                                    label="Protein (g)"
                                    type="number"
                                    placeholder="Optional"
                                    value={mealLog.protein}
                                    onChange={e => setMealLog({ ...mealLog, protein: e.target.value })}
                                />
                                <Input
                                    label="Carbs (g)"
                                    type="number"
                                    placeholder="Optional"
                                    value={mealLog.carbs}
                                    onChange={e => setMealLog({ ...mealLog, carbs: e.target.value })}
                                />
                                <Input
                                    label="Fats (g)"
                                    type="number"
                                    placeholder="Optional"
                                    value={mealLog.fats}
                                    onChange={e => setMealLog({ ...mealLog, fats: e.target.value })}
                                />
                            </div>
                            <Button className="w-full bg-orange-500 hover:bg-orange-600 border-0" onClick={handleLogMeal}>
                                Add Meal
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Hero Section */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="relative z-10 max-w-2xl">
                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold mb-4 border border-white/30">
                        <ChefHat className="h-3 w-3" />
                        <span>AI Nutritionist</span>
                    </div>
                    <h1 className="text-4xl font-bold mb-4 tracking-tight">Smart Nutrition & Meal Planning</h1>
                    <p className="text-emerald-50 text-lg leading-relaxed">
                        Track your daily intake and get personalized, AI-generated meal plans tailored to your health goals and dietary preferences.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left Column: Tracking & Stats */}
                <div className="lg:col-span-8 space-y-6">

                    {/* Calorie Chart */}
                    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="font-bold text-lg text-neutral-900">Weekly Calorie Intake</h3>
                                <p className="text-sm text-neutral-500">Average: {Math.round(calorieData.reduce((a, b) => a + b.calories, 0) / 7)} kcal</p>
                            </div>
                            <Badge variant="success" className="bg-emerald-100 text-emerald-700">On Track</Badge>
                        </div>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={calorieData}>
                                    <defs>
                                        <linearGradient id="colorCal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Area type="monotone" dataKey="calories" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorCal)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Today's Macros */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200 col-span-2">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="font-bold text-lg text-neutral-900">Macronutrient Breakdown</h3>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <div className="bg-purple-50 p-3 rounded-xl border border-purple-100 text-center">
                                    <p className="text-xs text-purple-600 font-bold uppercase">Protein</p>
                                    <p className="text-xl font-bold text-neutral-900">{todayMacros.protein}g</p>
                                </div>
                                <div className="bg-green-50 p-3 rounded-xl border border-green-100 text-center">
                                    <p className="text-xs text-green-600 font-bold uppercase">Carbs</p>
                                    <p className="text-xl font-bold text-neutral-900">{todayMacros.carbs}g</p>
                                </div>
                                <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 text-center">
                                    <p className="text-xs text-amber-600 font-bold uppercase">Fats</p>
                                    <p className="text-xl font-bold text-neutral-900">{todayMacros.fats}g</p>
                                </div>
                            </div>

                            <div className="h-[150px] flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={macroData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={40}
                                            outerRadius={60}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {macroData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Quick Add Meal */}
                        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-100 flex flex-col justify-center items-center text-center space-y-4">
                            <div className="bg-white p-4 rounded-full shadow-sm text-orange-500">
                                <Plus className="h-8 w-8" />
                            </div>
                            <div>
                                <h3 className="font-bold text-orange-900">Quick Log</h3>
                                <p className="text-xs text-orange-700 mt-1">Track calories & macros</p>
                            </div>
                            <Button onClick={() => setShowLogModal(true)} className="w-full bg-orange-500 hover:bg-orange-600 text-white border-0">Log Meal</Button>
                        </div>
                    </div>

                    {/* Today's Logged Meals List */}
                    {loggedMeals.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 animate-slide-in">
                            <h3 className="font-bold text-lg text-neutral-900 mb-4">Today's Meals</h3>
                            <div className="space-y-3">
                                {loggedMeals.map((meal) => (
                                    <div key={meal.id} className="flex justify-between items-center p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center text-orange-500 shadow-sm">
                                                <Utensils className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-neutral-900">{meal.name}</p>
                                                <p className="text-xs text-neutral-500">Logged at {meal.time}</p>
                                            </div>
                                        </div>
                                        <Badge variant="neutral">{meal.calories} kcal</Badge>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: AI Meal Planner */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white rounded-3xl shadow-xl shadow-neutral-100/50 border border-neutral-200 overflow-hidden">
                        <div className="bg-neutral-50 p-6 border-b border-neutral-100">
                            <h3 className="font-bold text-lg text-neutral-900 flex items-center gap-2">
                                <ChefHat className="h-5 w-5 text-indigo-500" />
                                AI Meal Planner
                            </h3>
                            <p className="text-sm text-neutral-500 mt-1">Generate a custom daily plan instantly.</p>
                        </div>

                        {!plan ? (
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-1">Diet Type</label>
                                    <select
                                        className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500 bg-neutral-50/50"
                                        value={preferences.dietType}
                                        onChange={(e) => setPreferences({ ...preferences, dietType: e.target.value })}
                                    >
                                        <option>Balanced</option>
                                        <option>Low Carb</option>
                                        <option>Keto</option>
                                        <option>Vegan</option>
                                        <option>Vegetarian</option>
                                        <option>High Protein</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-1">Goal</label>
                                    <select
                                        className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500 bg-neutral-50/50"
                                        value={preferences.goal}
                                        onChange={(e) => setPreferences({ ...preferences, goal: e.target.value })}
                                    >
                                        <option>Maintain Weight</option>
                                        <option>Lose Weight</option>
                                        <option>Build Muscle</option>
                                    </select>
                                </div>
                                <Input
                                    label="Calories Target"
                                    type="number"
                                    value={preferences.calories}
                                    onChange={(e) => setPreferences({ ...preferences, calories: parseInt(e.target.value) })}
                                />
                                <Input
                                    label="Allergies (Optional)"
                                    placeholder="e.g. Peanuts, Gluten"
                                    value={preferences.allergies}
                                    onChange={(e) => setPreferences({ ...preferences, allergies: e.target.value })}
                                />
                                <Button
                                    onClick={handleGenerate}
                                    isLoading={generating}
                                    className="w-full py-4 mt-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-200"
                                    icon={generating ? RefreshCw : Zap}
                                >
                                    {generating ? 'Designing Menu...' : 'Generate Meal Plan'}
                                </Button>
                            </div>
                        ) : (
                            <div className="p-0">
                                <div className="p-4 bg-indigo-50 border-b border-indigo-100 flex justify-between items-center">
                                    <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Your Custom Plan</span>
                                    <button onClick={() => setPlan(null)} className="p-1 hover:bg-indigo-100 rounded-full text-indigo-400">
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>

                                <div className="max-h-[500px] overflow-y-auto p-4 space-y-4 custom-scrollbar">
                                    <div className="bg-indigo-50/50 p-3 rounded-lg border border-indigo-100 mb-4">
                                        <p className="text-sm text-indigo-900 italic">"{plan.summary}"</p>
                                    </div>

                                    {plan.meals.map((meal: any, idx: number) => (
                                        <div key={idx} className="bg-white rounded-xl border border-neutral-100 shadow-sm p-4 hover:shadow-md transition-all">
                                            <div className="flex justify-between items-start mb-2">
                                                <Badge
                                                    variant="neutral"
                                                    className={`
                                                        ${meal.type === 'Breakfast' ? 'bg-orange-100 text-orange-700' :
                                                            meal.type === 'Lunch' ? 'bg-green-100 text-green-700' :
                                                                meal.type === 'Dinner' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}
                                                    `}
                                                >
                                                    {meal.type}
                                                </Badge>
                                                <span className="text-xs font-bold text-neutral-500">{meal.calories} kcal</span>
                                            </div>
                                            <h4 className="font-bold text-neutral-900 mb-1">{meal.name}</h4>
                                            <p className="text-xs text-neutral-500 mb-3 line-clamp-2">
                                                {meal.ingredients.join(', ')}
                                            </p>
                                            <div className="flex gap-2 text-[10px] font-mono text-neutral-400 bg-neutral-50 p-2 rounded-lg">
                                                <span>P: {meal.protein}</span>
                                                <span>C: {meal.carbs}</span>
                                                <span>F: {meal.fats}</span>
                                            </div>
                                        </div>
                                    ))}

                                    <div className="mt-4 pt-4 border-t border-neutral-100">
                                        <h4 className="text-sm font-bold text-neutral-900 mb-2 flex items-center gap-2">
                                            <ShoppingCart className="h-4 w-4" /> Shopping List
                                        </h4>
                                        <ul className="text-xs text-neutral-600 space-y-1 pl-1">
                                            {plan.shoppingList.slice(0, 5).map((item: string, i: number) => (
                                                <li key={i} className="flex items-center gap-2">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-400"></div>
                                                    {item}
                                                </li>
                                            ))}
                                            {plan.shoppingList.length > 5 && (
                                                <li className="text-indigo-500 italic">+ {plan.shoppingList.length - 5} more items...</li>
                                            )}
                                        </ul>
                                    </div>
                                </div>
                                <div className="p-4 border-t border-neutral-100 bg-neutral-50">
                                    <Button className="w-full" size="sm" icon={ShoppingCart}>Save to Shopping List</Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default PatientNutrition;
