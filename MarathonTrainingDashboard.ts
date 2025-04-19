import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Papa from 'papaparse';

const MarathonTrainingDashboard = () => {
  const [trainingData, setTrainingData] = useState([]);
  const [weeklyStats, setWeeklyStats] = useState([]);
  const [completionRate, setCompletionRate] = useState(0);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [maxDistance, setMaxDistance] = useState(0);
  const [feasibility, setFeasibility] = useState({
    overall: 'Pending',
    completion: 'Pending',
    distance: 'Pending',
    progression: 'Pending',
    recovery: 'Pending'
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        // Generate CSV data - this would normally be loaded from a file
        const csvData = `Day,Date,WorkoutType,Duration,Distance,Intensity,Completed,Notes
1,4/21/2025,Push + Short Run,60,1,Medium,,
2,4/22/2025,Pull + Short Run,60,2,Medium,,
3,4/23/2025,Long Run,30,3,Medium-High,,
4,4/24/2025,Legs + Core + Short Run,60,2,High,,
5,4/25/2025,Full Body + Short Run,60,3,Medium-High,,
6,4/26/2025,Long Run + Badminton,40,4,High,,
7,4/27/2025,Rest/Yoga,60,0,Low,,
8,4/28/2025,Push + Short Run,60,1,Medium,,
9,4/29/2025,Pull + Short Run,60,2,Medium,,
10,4/30/2025,Long Run,50,4,Medium-High,,
11,5/1/2025,Legs + Core + Short Run,60,3,High,,
12,5/2/2025,Full Body + Short Run,60,4,Medium-High,,
13,5/3/2025,Long Run + Badminton,50,5,High,,
14,5/4/2025,Rest/Yoga,60,0,Low,,
15,5/5/2025,Push + Short Run,60,2,Medium,,
16,5/6/2025,Pull + Short Run,60,3,Medium,,
17,5/7/2025,Long Run,60,5,Medium-High,,
18,5/8/2025,Legs + Core + Short Run,60,3,High,,
19,5/9/2025,Full Body + Short Run,60,4,Medium-High,,
20,5/10/2025,Long Run + Badminton,70,6,High,,
21,5/11/2025,Rest/Yoga,60,0,Low,,
22,5/12/2025,Push + Short Run,60,3,Medium,,
23,5/13/2025,Pull + Short Run,60,4,Medium,,
24,5/14/2025,Long Run,70,6,Medium-High,,
25,5/15/2025,Legs + Core + Short Run,60,4,High,,
26,5/16/2025,Full Body + Short Run,60,5,Medium-High,,
27,5/17/2025,Long Run + Badminton,80,7,High,,
28,5/18/2025,Rest/Yoga,60,0,Low,,
29,5/19/2025,Push + Short Run,60,3,Medium,,
30,5/20/2025,Pull + Short Run,60,4,Medium,,
31,5/21/2025,Long Run,90,6,Medium-High,,
32,5/22/2025,Legs + Core + Short Run,60,4,High,,
33,5/23/2025,Full Body + Short Run,60,5,Medium-High,,
34,5/24/2025,Long Run + Badminton,90,8,High,,
35,5/25/2025,Rest/Yoga,60,0,Low,,
36,5/26/2025,Push + Short Run,60,3,Medium,,
37,5/27/2025,Pull + Short Run,60,4,Medium,,
38,5/28/2025,Long Run,90,7,Medium-High,,
39,5/29/2025,Legs + Core + Short Run,60,4,High,,
40,5/30/2025,Full Body + Short Run,60,5,Medium-High,,`;
        
        // Parse CSV data
        const parsed = Papa.parse(csvData, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true
        });
        
        // Process data to add week number and feasibility check
        const processed = parsed.data.map(row => ({
          ...row,
          Week: Math.ceil(row.Day / 7),
          CompletedValue: row.Completed === 'Yes' ? 1 : 0,
          FeasibilityCheck: calculateFeasibility(row)
        }));
        
        setTrainingData(processed);
        
        // Calculate weekly stats
        const weeks = [...new Set(processed.map(row => row.Week))];
        const weeklyData = weeks.map(week => {
          const weekRows = processed.filter(row => row.Week === week);
          const totalDistance = weekRows.reduce((sum, row) => sum + (row.Distance || 0), 0);
          const completedRows = weekRows.filter(row => row.Completed === 'Yes').length;
          const completionRate = weekRows.length > 0 ? (completedRows / weekRows.length) * 100 : 0;
          
          return {
            week,
            totalDistance,
            completionRate,
            longRunDistance: Math.max(...weekRows.map(row => row.Distance || 0))
          };
        });
        
        setWeeklyStats(weeklyData);
        
        // Set max distance
        setMaxDistance(Math.max(...processed.map(row => row.Distance || 0)));
        
        // Calculate overall completion rate
        const completed = processed.filter(row => row.Completed === 'Yes').length;
        setCompletionRate(processed.length > 0 ? (completed / processed.length) * 100 : 0);
        
        // Update feasibility assessment
        updateFeasibilityAssessment(processed, weeklyData);
        
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    
    loadData();
  }, []);
  
  // Calculate individual row feasibility (simplified version)
  const calculateFeasibility = (row) => {
    if (row.Completed !== 'Yes') return 'Not Completed';
    
    // For long runs, check if distance is manageable for a beginner
    if (row.WorkoutType.includes('Long Run') && row.Distance > 10) {
      return 'Caution - High Distance';
    }
    
    return 'On Track';
  };
  
  // Update overall feasibility assessment
  const updateFeasibilityAssessment = (data, weeklyData) => {
    // Sample implementation - in a real dashboard, this would be more sophisticated
    const completed = data.filter(row => row.Completed === 'Yes').length;
    const completionRate = data.length > 0 ? (completed / data.length) * 100 : 0;
    
    // Check progression between weeks
    let progressionOk = true;
    for (let i = 1; i < weeklyData.length; i++) {
      if (weeklyData[i].totalDistance > weeklyData[i-1].totalDistance * 1.5) {
        progressionOk = false; // Too rapid increase
      }
    }
    
    const maxSingleRun = Math.max(...data.map(row => row.Distance || 0));
    
    setFeasibility({
      completion: completionRate >= 80 ? 'Good' : completionRate >= 60 ? 'Fair' : 'Needs Improvement',
      distance: maxSingleRun >= 15 ? 'Good' : maxSingleRun >= 10 ? 'Fair' : 'Building',
      progression: progressionOk ? 'Good' : 'Too Rapid',
      recovery: 'Pending (Needs user input)',
      overall: completionRate >= 70 && maxSingleRun >= 10 && progressionOk ? 'Favorable' : 'In Progress'
    });
  };
  
  // Sample data for toggles
  const handleMarkComplete = (day, isComplete) => {
    const newData = trainingData.map(row => {
      if (row.Day === day) {
        return { ...row, Completed: isComplete ? 'Yes' : 'No', CompletedValue: isComplete ? 1 : 0 };
      }
      return row;
    });
    
    setTrainingData(newData);
    
    // Recalculate stats
    const completed = newData.filter(row => row.Completed === 'Yes').length;
    setCompletionRate(newData.length > 0 ? (completed / newData.length) * 100 : 0);
    
    // Update weekly stats
    const weeks = [...new Set(newData.map(row => row.Week))];
    const weeklyData = weeks.map(week => {
      const weekRows = newData.filter(row => row.Week === week);
      const totalDistance = weekRows.reduce((sum, row) => sum + (row.Distance || 0), 0);
      const completedRows = weekRows.filter(row => row.Completed === 'Yes').length;
      const completionRate = weekRows.length > 0 ? (completedRows / weekRows.length) * 100 : 0;
      
      return {
        week,
        totalDistance,
        completionRate,
        longRunDistance: Math.max(...weekRows.map(row => row.Distance || 0))
      };
    });
    
    setWeeklyStats(weeklyData);
    
    // Update feasibility
    updateFeasibilityAssessment(newData, weeklyData);
  };
  
  // Filter data by current week
  const currentWeekData = trainingData.filter(row => row.Week === currentWeek);
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  // Prepare data for weekly distance chart
  const weeklyDistanceData = weeklyStats.map(week => ({
    name: `Week ${week.week}`,
    distance: week.totalDistance
  }));
  
  // Data for completion pie chart
  const completionData = [
    { name: 'Completed', value: trainingData.filter(row => row.Completed === 'Yes').length },
    { name: 'Not Completed', value: trainingData.filter(row => row.Completed !== 'Yes').length }
  ];
  
  return (
    <div className="flex flex-col p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-blue-800 mb-6">Marathon Training Dashboard</h1>
      
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Completion Rate</h3>
          <p className="text-2xl font-bold">{completionRate.toFixed(1)}%</p>
          <p className="text-sm text-gray-500">Target: 80%+</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Current Week</h3>
          <p className="text-2xl font-bold">{currentWeek} of 6</p>
          <div className="flex mt-2">
            <button 
              onClick={() => setCurrentWeek(Math.max(1, currentWeek - 1))}
              className="px-2 py-1 bg-blue-100 text-blue-800 rounded mr-2"
            >
              Prev
            </button>
            <button 
              onClick={() => setCurrentWeek(Math.min(6, currentWeek + 1))}
              className="px-2 py-1 bg-blue-100 text-blue-800 rounded"
            >
              Next
            </button>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Max Distance</h3>
          <p className="text-2xl font-bold">{maxDistance} km</p>
          <p className="text-sm text-gray-500">Marathon = 42.2 km</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Feasibility</h3>
          <p className={`text-2xl font-bold ${feasibility.overall === 'Favorable' ? 'text-green-600' : 'text-orange-500'}`}>
            {feasibility.overall}
          </p>
          <p className="text-sm text-gray-500">Based on your progress</p>
        </div>
      </div>
      
      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Weekly Distance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyDistanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis label={{ value: 'Distance (km)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Bar dataKey="distance" fill="#0088FE" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Completion Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={completionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {completionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Weekly Schedule */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Week {currentWeek} Schedule</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 border-b text-left">Day</th>
                <th className="py-2 px-4 border-b text-left">Date</th>
                <th className="py-2 px-4 border-b text-left">Workout</th>
                <th className="py-2 px-4 border-b text-center">Duration</th>
                <th className="py-2 px-4 border-b text-center">Distance</th>
                <th className="py-2 px-4 border-b text-center">Intensity</th>
                <th className="py-2 px-4 border-b text-center">Completed</th>
              </tr>
            </thead>
            <tbody>
              {currentWeekData.map((row) => (
                <tr key={row.Day} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{row.Day}</td>
                  <td className="py-2 px-4 border-b">{row.Date}</td>
                  <td className="py-2 px-4 border-b">{row.WorkoutType}</td>
                  <td className="py-2 px-4 border-b text-center">{row.Duration} min</td>
                  <td className="py-2 px-4 border-b text-center">{row.Distance} km</td>
                  <td className="py-2 px-4 border-b text-center">
                    <span 
                      className={`inline-block px-2 py-1 rounded text-xs ${
                        row.Intensity === 'Low' ? 'bg-green-100 text-green-800' :
                        row.Intensity === 'Medium' ? 'bg-blue-100 text-blue-800' :
                        row.Intensity === 'Medium-High' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}
                    >
                      {row.Intensity}
                    </span>
                  </td>
                  <td className="py-2 px-4 border-b text-center">
                    <select 
                      value={row.Completed || ''}
                      onChange={(e) => handleMarkComplete(row.Day, e.target.value === 'Yes')}
                      className="border rounded p-1"
                    >
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Feasibility Assessment */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Marathon Feasibility Assessment</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-700">Completion Rate</h4>
            <p className={`text-lg font-semibold ${
              feasibility.completion === 'Good' ? 'text-green-600' : 
              feasibility.completion === 'Fair' ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {feasibility.completion}
            </p>
            <p className="text-sm text-gray-500">Target: 80%+ workout completion</p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700">Distance Progression</h4>
            <p className={`text-lg font-semibold ${
              feasibility.distance === 'Good' ? 'text-green-600' : 
              feasibility.distance === 'Fair' ? 'text-yellow-600' : 'text-blue-600'
            }`}>
              {feasibility.distance}
            </p>
            <p className="text-sm text-gray-500">Building toward half-marathon distance</p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700">Weekly Progression</h4>
            <p className={`text-lg font-semibold ${
              feasibility.progression === 'Good' ? 'text-green-600' : 'text-red-600'
            }`}>
              {feasibility.progression}
            </p>
            <p className="text-sm text-gray-500">Weekly increase should be gradual (10-15%)</p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700">Recovery Capacity</h4>
            <p className="text-lg font-semibold text-gray-600">{feasibility.recovery}</p>
            <p className="text-sm text-gray-500">Note recovery quality in workout notes</p>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-800">Assessment Summary</h4>
          <p className="text-sm mt-2">
            This 40-day plan serves as a foundation for marathon training. A full marathon training plan typically spans 16-20 weeks (4-5 months). 
            Your progress on this initial plan will determine if you're ready to begin a dedicated marathon training program.
          </p>
          <p className="text-sm mt-2">
            <strong>Recommendation:</strong> After completing this 40-day plan, aim to build up to a half-marathon distance (21.1 km) comfortably 
            before committing to full marathon training. This approach reduces injury risk and improves your chances of success.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MarathonTrainingDashboard;
