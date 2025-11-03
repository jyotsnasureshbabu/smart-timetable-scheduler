// import { useState, useEffect } from 'react';
// import { batchAPI, autoScheduleAPI, timetableAPI } from '../services/api';
// import { Calendar, Zap, Download, Loader, CheckCircle, AlertCircle } from 'lucide-react';

// const TimetableGenerator = () => {
//   const [batches, setBatches] = useState([]);
//   const [selectedBatch, setSelectedBatch] = useState('');
//   const [batchDetails, setBatchDetails] = useState(null);
//   const [academicYear, setAcademicYear] = useState(2024);
//   const [semester, setSemester] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const [generatedSchedule, setGeneratedSchedule] = useState(null);
//   const [timetable, setTimetable] = useState([]);
//   const [error, setError] = useState('');

//   // ✅ CORRECTED TIME SLOTS - Matching your database
//   const timeSlots = [
//     { start: '08:00', end: '08:45', label: '8:00-8:45', period: 1 },
//     { start: '08:45', end: '09:30', label: '8:45-9:30', period: 2 },
//     { start: '09:30', end: '09:45', label: 'Break', period: 'BREAK', isBreak: true },
//     { start: '09:45', end: '10:30', label: '9:45-10:30', period: 3 },
//     { start: '10:30', end: '11:15', label: '10:30-11:15', period: 4 },
//     { start: '11:15', end: '12:00', label: '11:15-12:00', period: 5 },
//     { start: '12:00', end: '12:45', label: 'Lunch', period: 'Lunch', isBreak: true },
//     { start: '12:45', end: '13:30', label: '12:45-1:30', period: 6 },
//     { start: '13:30', end: '14:15', label: '1:30-2:15', period: 7 },
//     { start: '14:15', end: '15:00', label: '2:15-3:00', period: 8 }
//   ];

//   const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

//   useEffect(() => {
//     fetchBatches();
//   }, []);

//   const fetchBatches = async () => {
//     try {
//       const response = await batchAPI.getAll();
//       console.log('✅ Batches loaded:', response.data);
//       setBatches(response.data.data || response.data);
//     } catch (error) {
//       console.error('❌ Error fetching batches:', error);
//       setError('Failed to load batches');
//     }
//   };

//   const handleGenerate = async () => {
//     if (!selectedBatch) {
//       alert('Please select a batch first!');
//       return;
//     }

//     setLoading(true);
//     setError('');
    
//     try {
//       console.log('🚀 Generating timetable for batch:', selectedBatch);
      
//       const response = await autoScheduleAPI.generate(selectedBatch, {
//         academic_year: academicYear,
//         semester: semester
//       });

//       console.log('✅ Generation response:', response.data);
//       setGeneratedSchedule(response.data);
      
//       // Fetch the generated timetable
//       await fetchTimetable();
      
//     } catch (error) {
//       console.error('❌ Generation error:', error);
//       const errorMsg = error.response?.data?.message || error.message || 'Failed to generate timetable';
//       setError(errorMsg);
//       alert(errorMsg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchTimetable = async () => {
//     if (!selectedBatch) return;

//     try {
//       console.log('📥 Fetching timetable for batch:', selectedBatch);
      
//       const response = await timetableAPI.getAll({
//         batch_id: selectedBatch,
//         academic_year: academicYear,
//         semester: semester
//       });

//       console.log('✅ Timetable loaded:', response.data);
//       const data = response.data.data || response.data;
//       setTimetable(Array.isArray(data) ? data : []);
      
//     } catch (error) {
//       console.error('❌ Error fetching timetable:', error);
//       setTimetable([]);
//     }
//   };

//   const handleBatchChange = async (batchId) => {
//     setSelectedBatch(batchId);
//     setGeneratedSchedule(null);
//     setTimetable([]);
//     setError('');

//     if (batchId) {
//       try {
//         const response = await batchAPI.getById(batchId);
//         setBatchDetails(response.data.data || response.data);
//         await fetchTimetable();
//       } catch (error) {
//         console.error('Error loading batch details:', error);
//       }
//     }
//   };

//   // Get entry for specific day and time slot
//   const getEntry = (day, timeSlot) => {
//     if (!Array.isArray(timetable)) return null;
    
//     return timetable.find(entry => 
//       entry.day_name === day && 
//       entry.start_time === timeSlot.start
//     );
//   };

//   // Get subject color (yellow for important subjects)
//   const getSubjectColor = (subjectCode) => {
//     const importantSubjects = ['CB3501', 'CB3504', 'CB3503', 'APT'];
//     return importantSubjects.includes(subjectCode) ? '#FFEB3B' : '#E8F5E9';
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="max-w-full mx-auto space-y-6">
//         {/* Header */}
//         <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-lg">
//           <h1 className="text-4xl font-bold mb-2 flex items-center">
//             <Calendar className="mr-3" size={40} />
//             Chennai Institute of Technology - Timetable Generator
//           </h1>
//           <p className="text-blue-100 text-lg">
//             B.Tech CSBS - Automated Timetable Scheduling System
//           </p>
//         </div>

//         {/* Error Display */}
//         {error && (
//           <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center">
//             <AlertCircle className="text-red-600 mr-3" size={24} />
//             <span className="text-red-800">{error}</span>
//           </div>
//         )}

//         {/* Configuration Panel */}
//         <div className="bg-white rounded-xl shadow-md p-6">
//           <h2 className="text-2xl font-bold text-gray-800 mb-6">Configuration</h2>
          
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Select Batch *
//               </label>
//               <select
//                 value={selectedBatch}
//                 onChange={(e) => handleBatchChange(e.target.value)}
//                 className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-base"
//               >
//                 <option value="">-- Select a Batch --</option>
//                 {batches.map(batch => (
//                   <option key={batch.id} value={batch.id}>
//                     {batch.name} - {batch.department}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Academic Year
//               </label>
//               <input
//                 type="number"
//                 value={academicYear}
//                 onChange={(e) => setAcademicYear(parseInt(e.target.value))}
//                 className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-base"
//                 min="2020"
//                 max="2030"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Semester
//               </label>
//               <select
//                 value={semester}
//                 onChange={(e) => setSemester(parseInt(e.target.value))}
//                 className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-base"
//               >
//                 <option value={1}>Semester 5</option>
//                 <option value={2}>Semester 6</option>
//               </select>
//             </div>
//           </div>

//           <div className="flex flex-wrap gap-3">
//             <button
//               onClick={handleGenerate}
//               disabled={loading || !selectedBatch}
//               className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md font-semibold text-base"
//             >
//               {loading ? (
//                 <>
//                   <Loader className="animate-spin" size={20} />
//                   <span>Generating...</span>
//                 </>
//               ) : (
//                 <>
//                   <Zap size={20} />
//                   <span>Generate Timetable</span>
//                 </>
//               )}
//             </button>

//             {selectedBatch && timetable.length > 0 && (
//               <button
//                 onClick={fetchTimetable}
//                 className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 shadow-md font-semibold text-base"
//               >
//                 <Calendar size={20} />
//                 <span>Refresh Timetable</span>
//               </button>
//             )}
//           </div>
//         </div>

//         {/* Success Message */}
//         {generatedSchedule && generatedSchedule.entries > 0 && (
//           <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 shadow-md">
//             <div className="flex items-start">
//               <CheckCircle className="text-green-600 mt-1 mr-3 flex-shrink-0" size={28} />
//               <div className="flex-1">
//                 <h3 className="text-xl font-bold text-green-900 mb-3">
//                   ✅ {generatedSchedule.message}
//                 </h3>
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                   <div className="bg-white rounded-lg p-4 shadow-sm">
//                     <p className="text-sm text-gray-600 mb-1">Total Classes</p>
//                     <p className="text-3xl font-bold text-gray-800">{generatedSchedule.entries}</p>
//                   </div>
//                   <div className="bg-white rounded-lg p-4 shadow-sm">
//                     <p className="text-sm text-gray-600 mb-1">Completion</p>
//                     <p className="text-3xl font-bold text-green-600">
//                       {generatedSchedule.statistics?.completionRate || 0}%
//                     </p>
//                   </div>
//                   <div className="bg-white rounded-lg p-4 shadow-sm">
//                     <p className="text-sm text-gray-600 mb-1">Subjects</p>
//                     <p className="text-3xl font-bold text-gray-800">
//                       {generatedSchedule.statistics?.subjectsScheduled || 0}
//                     </p>
//                   </div>
//                   <div className="bg-white rounded-lg p-4 shadow-sm">
//                     <p className="text-sm text-gray-600 mb-1">Faculty</p>
//                     <p className="text-3xl font-bold text-gray-800">
//                       {generatedSchedule.statistics?.facultyUtilized || 0}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* College-Style Timetable */}
//         {timetable.length > 0 && (
//           <div className="bg-white rounded-xl shadow-lg p-6 overflow-x-auto">
//             <div className="mb-6">
//               <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
//                 Chennai Institute of Technology, Chennai - 600 069
//               </h2>
//               <h3 className="text-xl font-semibold text-gray-800 text-center mb-2">
//                 B.Tech CSBS
//               </h3>
//               <p className="text-center text-gray-700">
//                 Time table for period of July 2025 - December 2025
//               </p>
//               <div className="flex justify-between items-center mt-4">
//                 <div>
//                   <p><span className="font-semibold">Year/Sem:</span> {batchDetails?.year || 'III'} / {semester}</p>
//                   <p><span className="font-semibold">Venue:</span> Room 203 (CITAR)</p>
//                 </div>
//                 <div>
//                   <p><span className="font-semibold">Class Advisors:</span></p>
//                   <p>Mr. C.Selvaganesan / Ms.Vishali Muralidharan</p>
//                 </div>
//               </div>
//             </div>

//             <table className="w-full border-collapse border-2 border-black text-sm">
//               <thead>
//                 <tr className="bg-gray-200">
//                   <th className="border-2 border-black px-3 py-2 text-center font-bold">
//                     <div>Time</div>
//                     <div className="text-xs mt-1">Day /Period</div>
//                   </th>
//                   {timeSlots.map((slot, idx) => (
//                     <th key={idx} className="border-2 border-black px-2 py-2 text-center font-bold min-w-[90px]">
//                       <div className="text-xs">{slot.label}</div>
//                       {!slot.isBreak && <div className="text-xs font-normal mt-1">{slot.period}</div>}
//                     </th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {days.map((day, dayIdx) => (
//                   <tr key={dayIdx}>
//                     <td className="border-2 border-black px-3 py-3 font-bold text-center bg-gray-100">
//                       {day}
//                     </td>
//                     {timeSlots.map((slot, slotIdx) => {
//                       if (slot.isBreak) {
//                         return (
//                           <td key={slotIdx} className="border-2 border-black px-2 py-3 text-center bg-gray-200 font-semibold">
//                             {slot.period}
//                           </td>
//                         );
//                       }

//                       const entry = getEntry(day, slot);
                      
//                       return (
//                         <td 
//                           key={slotIdx} 
//                           className="border-2 border-black px-2 py-2 text-center align-middle"
//                           style={{ 
//                             backgroundColor: entry ? getSubjectColor(entry.subject_code) : 'white',
//                             minHeight: '60px'
//                           }}
//                         >
//                           {entry ? (
//                             <div className="flex flex-col justify-center min-h-[50px]">
//                               <div className="font-bold text-black text-xs leading-tight">
//                                 {entry.subject_code || entry.subject_name}
//                               </div>
//                             </div>
//                           ) : (
//                             <span className="text-gray-400">-</span>
//                           )}
//                         </td>
//                       );
//                     })}
//                   </tr>
//                 ))}
//               </tbody>
//             </table>

//             {/* Subject Legend */}
//             <div className="mt-6 border-2 border-black">
//               <table className="w-full text-sm">
//                 <thead>
//                   <tr className="bg-gray-100">
//                     <th className="border border-black px-3 py-2">S.No</th>
//                     <th className="border border-black px-3 py-2">Sub.Code</th>
//                     <th className="border border-black px-3 py-2">Subject Name</th>
//                     <th className="border border-black px-3 py-2">Credit</th>
//                     <th className="border border-black px-3 py-2">Faculty Incharge</th>
//                     <th className="border border-black px-3 py-2">No of Periods/week</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {Array.from(new Set(timetable.map(t => t.subject_id))).map((subjectId, idx) => {
//                     const entry = timetable.find(t => t.subject_id === subjectId);
//                     const periodCount = timetable.filter(t => t.subject_id === subjectId).length;
//                     return (
//                       <tr key={idx}>
//                         <td className="border border-black px-3 py-2 text-center">{idx + 1}</td>
//                         <td className="border border-black px-3 py-2">{entry.subject_code}</td>
//                         <td className="border border-black px-3 py-2">{entry.subject_name}</td>
//                         <td className="border border-black px-3 py-2 text-center">3</td>
//                         <td className="border border-black px-3 py-2">{entry.faculty_name}</td>
//                         <td className="border border-black px-3 py-2 text-center">{periodCount}</td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}

//         {/* Empty States */}
//         {!selectedBatch && !loading && (
//           <div className="bg-white rounded-xl shadow-md p-12 text-center">
//             <AlertCircle className="mx-auto mb-4 text-orange-400" size={56} />
//             <h3 className="text-2xl font-bold text-gray-800 mb-2">
//               Select a Batch to Get Started
//             </h3>
//             <p className="text-gray-600 text-lg">
//               Choose CSE-B-2024 from the dropdown to generate your timetable.
//             </p>
//           </div>
//         )}

//         {selectedBatch && !loading && timetable.length === 0 && !generatedSchedule && (
//           <div className="bg-white rounded-xl shadow-md p-12 text-center">
//             <Calendar className="mx-auto mb-4 text-gray-400" size={56} />
//             <h3 className="text-2xl font-bold text-gray-800 mb-2">
//               No Timetable Found
//             </h3>
//             <p className="text-gray-600 text-lg mb-4">
//               Click "Generate Timetable" to create your schedule.
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default TimetableGenerator;

import { useState, useEffect } from 'react';
import { Calendar, Zap, Download, Loader, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

const TimetableGenerator = () => {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [batchDetails, setBatchDetails] = useState(null);
  const [academicYear, setAcademicYear] = useState(2024);
  const [semester, setSemester] = useState(1);
  const [loading, setLoading] = useState(false);
  const [generatedSchedule, setGeneratedSchedule] = useState(null);
  const [timetable, setTimetable] = useState([]);
  const [error, setError] = useState('');

  // ✅ CORRECTED TIME SLOTS
  const timeSlots = [
    { start: '08:00', end: '08:45', label: '8:00-8:45', period: 1 },
    { start: '08:45', end: '09:30', label: '8:45-9:30', period: 2 },
    { start: '09:30', end: '09:45', label: 'Break', period: 'BREAK', isBreak: true },
    { start: '09:45', end: '10:30', label: '9:45-10:30', period: 3 },
    { start: '10:30', end: '11:15', label: '10:30-11:15', period: 4 },
    { start: '11:15', end: '12:00', label: '11:15-12:00', period: 5 },
    { start: '12:00', end: '12:45', label: 'Lunch', period: 'Lunch', isBreak: true },
    { start: '12:45', end: '13:30', label: '12:45-1:30', period: 6 },
    { start: '13:30', end: '14:15', label: '1:30-2:15', period: 7 },
    { start: '14:15', end: '15:00', label: '2:15-3:00', period: 8 }
  ];

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  // Mock API functions (replace with your actual API)
  const mockAPI = {
    batchAPI: {
      getAll: async () => ({
        data: [
          { id: '1', name: 'CSE-B-2024', department: 'Computer Science', year: 'III' }
        ]
      }),
      getById: async (id) => ({
        data: { id, name: 'CSE-B-2024', department: 'Computer Science', year: 'III' }
      })
    },
    timetableAPI: {
      getAll: async (params) => ({
        data: [
          // Monday
          { day_name: 'Monday', start_time: '08:00:00', subject_code: 'CB3501', subject_name: 'Artificial Intelligence', faculty_name: 'Dr. Smith', subject_id: 1 },
          { day_name: 'Monday', start_time: '08:45:00', subject_code: 'CB3504', subject_name: 'Machine Learning', faculty_name: 'Dr. Johnson', subject_id: 2 },
          { day_name: 'Monday', start_time: '09:45:00', subject_code: 'CB3503', subject_name: 'Data Science', faculty_name: 'Dr. Williams', subject_id: 3 },
          { day_name: 'Monday', start_time: '10:30:00', subject_code: 'CB3501', subject_name: 'Artificial Intelligence', faculty_name: 'Dr. Smith', subject_id: 1 },
          { day_name: 'Monday', start_time: '11:15:00', subject_code: 'APT', subject_name: 'Aptitude Training', faculty_name: 'Mr. Brown', subject_id: 4 },
          
          // Tuesday
          { day_name: 'Tuesday', start_time: '08:00:00', subject_code: 'CB3504', subject_name: 'Machine Learning', faculty_name: 'Dr. Johnson', subject_id: 2 },
          { day_name: 'Tuesday', start_time: '08:45:00', subject_code: 'CB3503', subject_name: 'Data Science', faculty_name: 'Dr. Williams', subject_id: 3 },
          { day_name: 'Tuesday', start_time: '09:45:00', subject_code: 'CB3501', subject_name: 'Artificial Intelligence', faculty_name: 'Dr. Smith', subject_id: 1 },
          { day_name: 'Tuesday', start_time: '10:30:00', subject_code: 'CB3504', subject_name: 'Machine Learning', faculty_name: 'Dr. Johnson', subject_id: 2 },
          
          // Wednesday
          { day_name: 'Wednesday', start_time: '08:00:00', subject_code: 'CB3503', subject_name: 'Data Science', faculty_name: 'Dr. Williams', subject_id: 3 },
          { day_name: 'Wednesday', start_time: '08:45:00', subject_code: 'CB3501', subject_name: 'Artificial Intelligence', faculty_name: 'Dr. Smith', subject_id: 1 },
          { day_name: 'Wednesday', start_time: '09:45:00', subject_code: 'CB3504', subject_name: 'Machine Learning', faculty_name: 'Dr. Johnson', subject_id: 2 },
          
          // Thursday
          { day_name: 'Thursday', start_time: '08:00:00', subject_code: 'CB3501', subject_name: 'Artificial Intelligence', faculty_name: 'Dr. Smith', subject_id: 1 },
          { day_name: 'Thursday', start_time: '08:45:00', subject_code: 'CB3503', subject_name: 'Data Science', faculty_name: 'Dr. Williams', subject_id: 3 },
          { day_name: 'Thursday', start_time: '09:45:00', subject_code: 'APT', subject_name: 'Aptitude Training', faculty_name: 'Mr. Brown', subject_id: 4 },
          
          // Friday
          { day_name: 'Friday', start_time: '08:00:00', subject_code: 'CB3504', subject_name: 'Machine Learning', faculty_name: 'Dr. Johnson', subject_id: 2 },
          { day_name: 'Friday', start_time: '08:45:00', subject_code: 'CB3501', subject_name: 'Artificial Intelligence', faculty_name: 'Dr. Smith', subject_id: 1 },
          { day_name: 'Friday', start_time: '09:45:00', subject_code: 'CB3503', subject_name: 'Data Science', faculty_name: 'Dr. Williams', subject_id: 3 },
        ]
      })
    },
    autoScheduleAPI: {
      generate: async (batchId, params) => ({
        data: {
          message: 'Timetable generated successfully!',
          entries: 18,
          statistics: {
            completionRate: 95,
            subjectsScheduled: 4,
            facultyUtilized: 4
          }
        }
      })
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const response = await mockAPI.batchAPI.getAll();
      console.log('✅ Batches loaded:', response.data);
      setBatches(response.data);
    } catch (error) {
      console.error('❌ Error fetching batches:', error);
      setError('Failed to load batches');
    }
  };

  const handleGenerate = async () => {
    if (!selectedBatch) {
      alert('Please select a batch first!');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      console.log('🚀 Generating timetable for batch:', selectedBatch);
      
      const response = await mockAPI.autoScheduleAPI.generate(selectedBatch, {
        academic_year: academicYear,
        semester: semester
      });

      console.log('✅ Generation response:', response.data);
      setGeneratedSchedule(response.data);
      
      await fetchTimetable();
      
    } catch (error) {
      console.error('❌ Generation error:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to generate timetable';
      setError(errorMsg);
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const fetchTimetable = async () => {
    if (!selectedBatch) return;

    try {
      console.log('📥 Fetching timetable for batch:', selectedBatch);
      
      const response = await mockAPI.timetableAPI.getAll({
        batch_id: selectedBatch,
        academic_year: academicYear,
        semester: semester
      });

      console.log('✅ Timetable loaded:', response.data);
      const data = response.data;
      setTimetable(Array.isArray(data) ? data : []);
      
    } catch (error) {
      console.error('❌ Error fetching timetable:', error);
      setTimetable([]);
    }
  };

  const handleBatchChange = async (batchId) => {
    setSelectedBatch(batchId);
    setGeneratedSchedule(null);
    setTimetable([]);
    setError('');

    if (batchId) {
      try {
        const response = await mockAPI.batchAPI.getById(batchId);
        setBatchDetails(response.data);
        await fetchTimetable();
      } catch (error) {
        console.error('Error loading batch details:', error);
      }
    }
  };

  // ✅ IMPROVED: Normalize time format for comparison
  const normalizeTime = (time) => {
    if (!time) return '';
    // Remove seconds if present: "08:00:00" -> "08:00"
    return time.substring(0, 5);
  };

  // ✅ IMPROVED: Get entry with better matching
  const getEntry = (day, timeSlot) => {
    if (!Array.isArray(timetable) || timetable.length === 0) {
      console.log('⚠️ Timetable is empty or not an array');
      return null;
    }
    
    const entry = timetable.find(entry => {
      const matchDay = entry.day_name === day;
      const matchTime = normalizeTime(entry.start_time) === timeSlot.start;
      
      if (matchDay && matchTime) {
        console.log('✅ Match found:', { day, time: timeSlot.start, entry });
      }
      
      return matchDay && matchTime;
    });
    
    return entry;
  };

  const getSubjectColor = (subjectCode) => {
    const importantSubjects = ['CB3501', 'CB3504', 'CB3503', 'APT'];
    return importantSubjects.includes(subjectCode) ? '#FFEB3B' : '#E8F5E9';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-full mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-lg">
          <h1 className="text-4xl font-bold mb-2 flex items-center">
            <Calendar className="mr-3" size={40} />
            Chennai Institute of Technology - Timetable Generator
          </h1>
          <p className="text-blue-100 text-lg">
            B.Tech CSBS - Automated Timetable Scheduling System
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center">
            <AlertCircle className="text-red-600 mr-3" size={24} />
            <span className="text-red-800">{error}</span>
          </div>
        )}

        {/* Debug Info */}
        {selectedBatch && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            <p className="font-semibold text-blue-900">Debug Info:</p>
            <p className="text-blue-800">Total entries loaded: {timetable.length}</p>
            {timetable.length > 0 && (
              <details className="mt-2">
                <summary className="cursor-pointer text-blue-700 font-medium">View sample data</summary>
                <pre className="mt-2 text-xs bg-white p-2 rounded overflow-auto max-h-40">
                  {JSON.stringify(timetable.slice(0, 3), null, 2)}
                </pre>
              </details>
            )}
          </div>
        )}

        {/* Configuration Panel */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Configuration</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Batch *
              </label>
              <select
                value={selectedBatch}
                onChange={(e) => handleBatchChange(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-base"
              >
                <option value="">-- Select a Batch --</option>
                {batches.map(batch => (
                  <option key={batch.id} value={batch.id}>
                    {batch.name} - {batch.department}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Academic Year
              </label>
              <input
                type="number"
                value={academicYear}
                onChange={(e) => setAcademicYear(parseInt(e.target.value))}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-base"
                min="2020"
                max="2030"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Semester
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(parseInt(e.target.value))}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-base"
              >
                <option value={1}>Semester 5</option>
                <option value={2}>Semester 6</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleGenerate}
              disabled={loading || !selectedBatch}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md font-semibold text-base"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Zap size={20} />
                  <span>Generate Timetable</span>
                </>
              )}
            </button>

            {selectedBatch && (
              <button
                onClick={fetchTimetable}
                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 shadow-md font-semibold text-base"
              >
                <RefreshCw size={20} />
                <span>Refresh Timetable</span>
              </button>
            )}
          </div>
        </div>

        {/* Success Message */}
        {generatedSchedule && generatedSchedule.entries > 0 && (
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 shadow-md">
            <div className="flex items-start">
              <CheckCircle className="text-green-600 mt-1 mr-3 flex-shrink-0" size={28} />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-green-900 mb-3">
                  ✅ {generatedSchedule.message}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-gray-600 mb-1">Total Classes</p>
                    <p className="text-3xl font-bold text-gray-800">{generatedSchedule.entries}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-gray-600 mb-1">Completion</p>
                    <p className="text-3xl font-bold text-green-600">
                      {generatedSchedule.statistics?.completionRate || 0}%
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-gray-600 mb-1">Subjects</p>
                    <p className="text-3xl font-bold text-gray-800">
                      {generatedSchedule.statistics?.subjectsScheduled || 0}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-gray-600 mb-1">Faculty</p>
                    <p className="text-3xl font-bold text-gray-800">
                      {generatedSchedule.statistics?.facultyUtilized || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* College-Style Timetable */}
        {timetable.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 overflow-x-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
                Chennai Institute of Technology, Chennai - 600 069
              </h2>
              <h3 className="text-xl font-semibold text-gray-800 text-center mb-2">
                B.Tech CSBS
              </h3>
              <p className="text-center text-gray-700">
                Time table for period of July 2025 - December 2025
              </p>
              <div className="flex justify-between items-center mt-4">
                <div>
                  <p><span className="font-semibold">Year/Sem:</span> {batchDetails?.year || 'III'} / {semester}</p>
                  <p><span className="font-semibold">Venue:</span> Room 203 (CITAR)</p>
                </div>
                <div>
                  <p><span className="font-semibold">Class Advisors:</span></p>
                  <p>Mr. C.Selvaganesan / Ms.Vishali Muralidharan</p>
                </div>
              </div>
            </div>

            <table className="w-full border-collapse border-2 border-black text-sm">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border-2 border-black px-3 py-2 text-center font-bold">
                    <div>Time</div>
                    <div className="text-xs mt-1">Day /Period</div>
                  </th>
                  {timeSlots.map((slot, idx) => (
                    <th key={idx} className="border-2 border-black px-2 py-2 text-center font-bold min-w-[90px]">
                      <div className="text-xs">{slot.label}</div>
                      {!slot.isBreak && <div className="text-xs font-normal mt-1">{slot.period}</div>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {days.map((day, dayIdx) => (
                  <tr key={dayIdx}>
                    <td className="border-2 border-black px-3 py-3 font-bold text-center bg-gray-100">
                      {day}
                    </td>
                    {timeSlots.map((slot, slotIdx) => {
                      if (slot.isBreak) {
                        return (
                          <td key={slotIdx} className="border-2 border-black px-2 py-3 text-center bg-gray-200 font-semibold">
                            {slot.period}
                          </td>
                        );
                      }

                      const entry = getEntry(day, slot);
                      
                      return (
                        <td 
                          key={slotIdx} 
                          className="border-2 border-black px-2 py-2 text-center align-middle"
                          style={{ 
                            backgroundColor: entry ? getSubjectColor(entry.subject_code) : 'white',
                            minHeight: '60px'
                          }}
                        >
                          {entry ? (
                            <div className="flex flex-col justify-center min-h-[50px]">
                              <div className="font-bold text-black text-xs leading-tight">
                                {entry.subject_code || entry.subject_name}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Subject Legend */}
            <div className="mt-6 border-2 border-black">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-black px-3 py-2">S.No</th>
                    <th className="border border-black px-3 py-2">Sub.Code</th>
                    <th className="border border-black px-3 py-2">Subject Name</th>
                    <th className="border border-black px-3 py-2">Credit</th>
                    <th className="border border-black px-3 py-2">Faculty Incharge</th>
                    <th className="border border-black px-3 py-2">No of Periods/week</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from(new Set(timetable.map(t => t.subject_id))).map((subjectId, idx) => {
                    const entry = timetable.find(t => t.subject_id === subjectId);
                    const periodCount = timetable.filter(t => t.subject_id === subjectId).length;
                    return (
                      <tr key={idx}>
                        <td className="border border-black px-3 py-2 text-center">{idx + 1}</td>
                        <td className="border border-black px-3 py-2">{entry.subject_code}</td>
                        <td className="border border-black px-3 py-2">{entry.subject_name}</td>
                        <td className="border border-black px-3 py-2 text-center">3</td>
                        <td className="border border-black px-3 py-2">{entry.faculty_name}</td>
                        <td className="border border-black px-3 py-2 text-center">{periodCount}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty States */}
        {!selectedBatch && !loading && (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <AlertCircle className="mx-auto mb-4 text-orange-400" size={56} />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Select a Batch to Get Started
            </h3>
            <p className="text-gray-600 text-lg">
              Choose CSE-B-2024 from the dropdown to generate your timetable.
            </p>
          </div>
        )}

        {selectedBatch && !loading && timetable.length === 0 && !generatedSchedule && (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Calendar className="mx-auto mb-4 text-gray-400" size={56} />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              No Timetable Found
            </h3>
            <p className="text-gray-600 text-lg mb-4">
              Click "Generate Timetable" to create your schedule.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimetableGenerator;