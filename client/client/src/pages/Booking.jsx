import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useApi } from '../hooks/useApi';

// Mock data for development/testing
const mockCounsellors = [
  {
    id: 1,
    name: 'Dr. Sarah Johnson',
    specialization: 'Clinical Psychology',
    rating: 4.8,
    experience: '8 years',
    profileImage: null,
  },
  {
    id: 2,
    name: 'Dr. Michael Chen',
    specialization: 'Academic Counselling',
    rating: 4.6,
    experience: '5 years',
    profileImage: null,
  },
  {
    id: 3,
    name: 'Dr. Emily Rodriguez',
    specialization: 'Stress Management',
    rating: 4.9,
    experience: '10 years',
    profileImage: null,
  },
];

// Available time slots for each day (9 AM to 6 PM)
const getAvailableTimeSlots = () => {
  const slots = [];
  for (let hour = 9; hour <= 17; hour++) { // 9 AM to 5 PM (last slot at 5 PM for 1-hour session)
    slots.push({
      value: hour,
      label: `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`,
      display: `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`
    });
    // Add 30-minute slots
    if (hour < 17) { // Don't add 30-minute slot for last hour
      slots.push({
        value: hour + 0.5,
        label: `${hour > 12 ? hour - 12 : hour}:30 ${hour >= 12 ? 'PM' : 'AM'}`,
        display: `${hour > 12 ? hour - 12 : hour}:30 ${hour >= 12 ? 'PM' : 'AM'}`
      });
    }
  }
  return slots;
};

const AVAILABLE_TIME_SLOTS = getAvailableTimeSlots();

const Booking = () => {
  const { t } = useTranslation();
  const { callApi } = useApi();

  // State management for the booking flow
  const [step, setStep] = useState(1); // 1: Select Counsellor, 2: Select Date & Time, 3: Booking Form
  const [counsellors, setCounsellors] = useState([]);
  const [selectedCounsellor, setSelectedCounsellor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedDuration, setSelectedDuration] = useState(60); // Default 60 minutes
  const [appointmentMode, setAppointmentMode] = useState('chat');
  const [appointmentReason, setAppointmentReason] = useState('');
  const [appointmentUrgency, setAppointmentUrgency] = useState('medium');
  const [location, setLocation] = useState('');
  const [privateNotes, setPrivateNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Load counsellors on component mount
  useEffect(() => {
    fetchCounsellors();
  }, []);

  const fetchCounsellors = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Try to fetch from API first
      if (typeof callApi === 'function') {
        const response = await callApi('/api/v1/counsellors', 'GET');
        if (response.success && response.data && response.data.length > 0) {
          setCounsellors(response.data);
          setLoading(false);
          return;
        }
      }
      
      // Fallback to mock data
      console.log('Using mock counsellors data');
      setCounsellors(mockCounsellors);
    } catch (err) {
      console.error('Error fetching counsellors:', err);
      // Use mock data as fallback
      console.log('Falling back to mock counsellors data');
      setCounsellors(mockCounsellors);
    } finally {
      setLoading(false);
    }
  };

  const handleCounsellorSelect = (counsellor) => {
    setSelectedCounsellor(counsellor);
    setStep(2); // Move to date/time selection
  };

  const handleDateTimeSelect = () => {
    if (selectedDate && selectedTime) {
      setStep(3);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Create start and end times from selected date and time
      const [year, month, day] = selectedDate.split('-');
      const startHour = Math.floor(selectedTime);
      const startMinutes = (selectedTime % 1) * 60;
      
      const startDateTime = new Date(year, month - 1, day, startHour, startMinutes);
      const endDateTime = new Date(startDateTime.getTime() + selectedDuration * 60 * 1000);

      const bookingData = {
        counsellorId: selectedCounsellor.id,
        slotStart: startDateTime.toISOString(),
        slotEnd: endDateTime.toISOString(),
        duration: selectedDuration,
        mode: appointmentMode,
        reason: appointmentReason.trim() || 'General counselling session',
        urgency: appointmentUrgency,
        location: appointmentMode === 'in-person' ? location.trim() : undefined,
        privateNotes: privateNotes.trim() || undefined
      };

      if (typeof callApi === 'function') {
        const response = await callApi('/api/v1/appointments', 'POST', bookingData);
        if (response.success) {
          setBookingSuccess(true);
          // Reset form after successful booking
          setTimeout(() => {
            resetBookingFlow();
          }, 3000);
          setLoading(false);
          return;
        } else {
          setError(response.error || 'Failed to book appointment. Please try again.');
        }
      } else {
        // Mock successful booking for development
        console.log('Mock booking created:', bookingData);
        setBookingSuccess(true);
        setTimeout(() => {
          resetBookingFlow();
        }, 3000);
      }
    } catch (err) {
      console.error('Error creating booking:', err);
      setError('Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetBookingFlow = () => {
    setStep(1);
    setSelectedCounsellor(null);
    setSelectedDate('');
    setSelectedTime('');
    setSelectedDuration(60);
    setAppointmentMode('chat');
    setAppointmentReason('');
    setAppointmentUrgency('medium');
    setLocation('');
    setPrivateNotes('');
    setBookingSuccess(false);
    setError(null);
  };

  const goBack = () => {
    if (step === 2) {
      setStep(1);
      setSelectedCounsellor(null);
      setSelectedDate('');
      setSelectedTime('');
    } else if (step === 3) {
      setStep(2);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Get maximum date (3 months from now)
  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    return maxDate.toISOString().split('T')[0];
  };

  if (bookingSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl p-8 text-center"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Successful!</h2>
            <p className="text-gray-600 mb-6">Your counselling session has been booked successfully.</p>
            <p className="text-sm text-gray-500">Redirecting back to booking page...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Counsellor Talk
          </h1>
          <p className="text-lg text-gray-600 mb-4">Professional Support System - Direct access to certified counsellors</p>
          
          {/* Flow Explanation */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 mb-6 border border-green-200 max-w-4xl mx-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center justify-center">
              <span className="mr-2">👨‍⚕️</span>
              How Counsellor Talk Works
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-2xl mb-2">📅</div>
                <div className="font-medium text-gray-900 mb-1">1. Choose Session</div>
                <div className="text-gray-600">Select chat, video, or offline meet</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-2xl mb-2">✅</div>
                <div className="font-medium text-gray-900 mb-1">2. Book & Confirm</div>
                <div className="text-gray-600">Get confirmation & session link</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-2xl mb-2">💬</div>
                <div className="font-medium text-gray-900 mb-1">3. Attend Session</div>
                <div className="text-gray-600">Meet with certified counsellor</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-2xl mb-2">📋</div>
                <div className="font-medium text-gray-900 mb-1">4. Follow-up</div>
                <div className="text-gray-600">Report sent to admin, further sessions if needed</div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNumber 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step > stepNumber ? 'bg-indigo-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-2">
            <span className="text-sm text-gray-600">
              {step === 1 && 'Select a Counsellor'}
              {step === 2 && 'Choose Date & Time'}
              {step === 3 && 'Confirm Your Booking'}
            </span>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
          >
            <div className="flex">
              <svg className="w-5 h-5 text-red-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Back Button */}
          {step > 1 && (
            <div className="px-6 py-4 border-b border-gray-200">
              <button
                onClick={goBack}
                className="flex items-center text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
            </div>
          )}

          <div className="p-6">
            {/* Step 1: Select Counsellor */}
            {step === 1 && (
              <CounsellorSelection
                counsellors={counsellors}
                loading={loading}
                onSelect={handleCounsellorSelect}
                t={t}
              />
            )}

            {/* Step 2: Select Date & Time */}
            {step === 2 && selectedCounsellor && (
              <DateTimeSelection
                counsellor={selectedCounsellor}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                selectedTime={selectedTime}
                setSelectedTime={setSelectedTime}
                selectedDuration={selectedDuration}
                setSelectedDuration={setSelectedDuration}
                onNext={handleDateTimeSelect}
                getMinDate={getMinDate}
                getMaxDate={getMaxDate}
                t={t}
              />
            )}

            {/* Step 3: Booking Form */}
            {step === 3 && selectedCounsellor && selectedDate && selectedTime && (
              <BookingForm
                counsellor={selectedCounsellor}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                selectedDuration={selectedDuration}
                appointmentMode={appointmentMode}
                setAppointmentMode={setAppointmentMode}
                appointmentReason={appointmentReason}
                setAppointmentReason={setAppointmentReason}
                appointmentUrgency={appointmentUrgency}
                setAppointmentUrgency={setAppointmentUrgency}
                location={location}
                setLocation={setLocation}
                privateNotes={privateNotes}
                setPrivateNotes={setPrivateNotes}
                onSubmit={handleBookingSubmit}
                loading={loading}
                formatDate={formatDate}
                formatTime={formatTime}
                t={t}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Counsellor Selection Component
const CounsellorSelection = ({ counsellors, loading, onSelect, t }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-gray-600">{t('booking.loading.counsellors')}</span>
      </div>
    );
  }

  if (counsellors.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">{t('booking.noCounsellors.title')}</h3>
        <p className="text-gray-600">{t('booking.noCounsellors.message')}</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('booking.selectCounsellor.title')}</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {counsellors.map((counsellor) => (
          <motion.div
            key={counsellor.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all"
            onClick={() => onSelect(counsellor)}
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                {counsellor.profileImage ? (
                  <img
                    src={counsellor.profileImage}
                    alt={counsellor.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <svg className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{counsellor.name}</h3>
                <p className="text-sm text-gray-600">{counsellor.specialization}</p>
                {counsellor.rating && (
                  <div className="flex items-center mt-1">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${i < Math.floor(counsellor.rating) ? 'fill-current' : 'text-gray-300'}`}
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 ml-1">({counsellor.rating})</span>
                  </div>
                )}
                {counsellor.experience && (
                  <p className="text-xs text-gray-500 mt-1">{counsellor.experience} {t('booking.yearsExperience')}</p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Date and Time Selection Component
const DateTimeSelection = ({ 
  counsellor, 
  selectedDate, 
  setSelectedDate, 
  selectedTime, 
  setSelectedTime,
  selectedDuration,
  setSelectedDuration,
  onNext, 
  getMinDate, 
  getMaxDate, 
  t 
}) => {
  const timeSlots = AVAILABLE_TIME_SLOTS;
  const isFormValid = selectedDate && selectedTime;

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Choose Date & Time</h2>
        <p className="text-gray-600 mt-1">Counsellor: {counsellor.name}</p>
      </div>

      {/* Date Selection */}
      <div>
        <label htmlFor="appointment-date" className="block text-sm font-medium text-gray-700 mb-3">
          Select Date <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            id="appointment-date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={getMinDate()}
            max={getMaxDate()}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg"
            required
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 6v6m-4-6h8m-4-6V3m0 10h.01" />
            </svg>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          You can book appointments from tomorrow up to 3 months in advance.
        </p>
      </div>

      {/* Time Selection */}
      <div>
        <label htmlFor="appointment-time" className="block text-sm font-medium text-gray-700 mb-3">
          Select Time <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {timeSlots.map((slot) => (
            <motion.button
              key={slot.value}
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedTime(slot.value)}
              className={`p-3 rounded-lg border-2 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                selectedTime === slot.value
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-300 hover:bg-indigo-50'
              }`}
            >
              {slot.display}
            </motion.button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Available time slots: 9:00 AM to 6:00 PM (30-minute intervals)
        </p>
      </div>

      {/* Duration Selection */}
      <div>
        <label htmlFor="session-duration" className="block text-sm font-medium text-gray-700 mb-3">
          Session Duration
        </label>
        <select
          id="session-duration"
          value={selectedDuration}
          onChange={(e) => setSelectedDuration(parseInt(e.target.value))}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value={30}>30 minutes</option>
          <option value={60}>60 minutes (Recommended)</option>
          <option value={90}>90 minutes</option>
        </select>
      </div>

      {/* Selected Date and Time Summary */}
      {selectedDate && selectedTime && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 rounded-lg p-4"
        >
          <h4 className="font-medium text-green-900 mb-2">Selected Appointment</h4>
          <div className="space-y-1 text-sm text-green-800">
            <div className="flex justify-between">
              <span>Date:</span>
              <span className="font-medium">
                {new Date(selectedDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Time:</span>
              <span className="font-medium">
                {timeSlots.find(slot => slot.value === selectedTime)?.display}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Duration:</span>
              <span className="font-medium">{selectedDuration} minutes</span>
            </div>
            <div className="flex justify-between">
              <span>End Time:</span>
              <span className="font-medium">
                {AVAILABLE_TIME_SLOTS.find(slot => slot.value === selectedTime + (selectedDuration / 60))?.display || 
                 `${Math.floor(selectedTime + (selectedDuration / 60)) > 12 ? 
                   Math.floor(selectedTime + (selectedDuration / 60)) - 12 : 
                   Math.floor(selectedTime + (selectedDuration / 60))}:${
                   ((selectedTime + (selectedDuration / 60)) % 1) * 60 === 0 ? '00' : 
                   ((selectedTime + (selectedDuration / 60)) % 1) * 60
                 } ${Math.floor(selectedTime + (selectedDuration / 60)) >= 12 ? 'PM' : 'AM'}`
                }
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Continue Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onNext}
        disabled={!isFormValid}
        className={`w-full py-3 px-4 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
          isFormValid
            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        Continue to Booking Details
      </motion.button>
    </div>
  );
};

// Booking Form Component
const BookingForm = ({ 
  counsellor, 
  selectedDate,
  selectedTime,
  selectedDuration,
  appointmentMode, 
  setAppointmentMode,
  appointmentReason,
  setAppointmentReason,
  appointmentUrgency,
  setAppointmentUrgency,
  location,
  setLocation,
  privateNotes, 
  setPrivateNotes, 
  onSubmit, 
  loading, 
  formatDate, 
  formatTime, 
  t 
}) => {
  // Form validation
  const isFormValid = () => {
    if (!appointmentMode) return false;
    if (appointmentMode === 'in-person' && !location.trim()) return false;
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      alert('Please fill in all required fields.');
      return;
    }
    onSubmit(e);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('booking.confirmBooking.title')}</h2>
      
      {/* Booking Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="font-medium text-gray-900 mb-3">Booking Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Counsellor:</span>
            <span className="font-medium">{counsellor.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Date:</span>
            <span className="font-medium">
              {new Date(selectedDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Start Time:</span>
            <span className="font-medium">
              {AVAILABLE_TIME_SLOTS.find(slot => slot.value === selectedTime)?.display}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Duration:</span>
            <span className="font-medium">{selectedDuration} minutes</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">End Time:</span>
            <span className="font-medium">
              {AVAILABLE_TIME_SLOTS.find(slot => slot.value === selectedTime + (selectedDuration / 60))?.display || 
               `${Math.floor(selectedTime + (selectedDuration / 60)) > 12 ? 
                 Math.floor(selectedTime + (selectedDuration / 60)) - 12 : 
                 Math.floor(selectedTime + (selectedDuration / 60))}:${
                 ((selectedTime + (selectedDuration / 60)) % 1) * 60 === 0 ? '00' : 
                 ((selectedTime + (selectedDuration / 60)) % 1) * 60
               } ${Math.floor(selectedTime + (selectedDuration / 60)) >= 12 ? 'PM' : 'AM'}`
              }
            </span>
          </div>
        </div>
      </div>

      {/* Booking Details Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Session Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Session Type <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className={`border-2 p-4 rounded-lg cursor-pointer transition-colors ${
              appointmentMode === 'chat' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-gray-400'
            }`}>
              <input
                type="radio"
                name="appointmentMode"
                value="chat"
                checked={appointmentMode === 'chat'}
                onChange={(e) => setAppointmentMode(e.target.value)}
                className="sr-only"
              />
              <div className="text-center">
                <div className="text-2xl mb-2">�</div>
                <div className="font-medium">Online Chat</div>
                <div className="text-sm text-gray-600">Text-based counselling session</div>
              </div>
            </label>

            <label className={`border-2 p-4 rounded-lg cursor-pointer transition-colors ${
              appointmentMode === 'video' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-gray-400'
            }`}>
              <input
                type="radio"
                name="appointmentMode"
                value="video"
                checked={appointmentMode === 'video'}
                onChange={(e) => setAppointmentMode(e.target.value)}
                className="sr-only"
              />
              <div className="text-center">
                <div className="text-2xl mb-2">📹</div>
                <div className="font-medium">Video Call</div>
                <div className="text-sm text-gray-600">Face-to-face video consultation</div>
              </div>
            </label>
            
            <label className={`border-2 p-4 rounded-lg cursor-pointer transition-colors ${
              appointmentMode === 'in-person' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-gray-400'
            }`}>
              <input
                type="radio"
                name="appointmentMode"
                value="in-person"
                checked={appointmentMode === 'in-person'}
                onChange={(e) => setAppointmentMode(e.target.value)}
                className="sr-only"
              />
              <div className="text-center">
                <div className="text-2xl mb-2">🏢</div>
                <div className="font-medium">Offline Meet</div>
                <div className="text-sm text-gray-600">On-campus face-to-face meeting</div>
              </div>
            </label>
          </div>
        </div>

        {/* Location (only for in-person) */}
        {appointmentMode === 'in-person' && (
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              Meeting Location <span className="text-red-500">*</span>
            </label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter the meeting location (e.g., Counselling Center Room 101)"
              required
            />
          </div>
        )}

        {/* Appointment Reason */}
        <div>
          <label htmlFor="appointmentReason" className="block text-sm font-medium text-gray-700 mb-2">
            Reason for Appointment
          </label>
          <textarea
            id="appointmentReason"
            rows={3}
            value={appointmentReason}
            onChange={(e) => setAppointmentReason(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 resize-none"
            placeholder="Brief description of what you'd like to discuss (optional)"
            maxLength={500}
          />
          <p className="text-xs text-gray-500 mt-1">{appointmentReason.length}/500 characters</p>
        </div>

        {/* Urgency Level */}
        <div>
          <label htmlFor="appointmentUrgency" className="block text-sm font-medium text-gray-700 mb-2">
            Urgency Level
          </label>
          <select
            id="appointmentUrgency"
            value={appointmentUrgency}
            onChange={(e) => setAppointmentUrgency(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="low">Low - General support</option>
            <option value="medium">Medium - Regular counselling</option>
            <option value="high">High - Need timely support</option>
            <option value="urgent">Urgent - Crisis situation</option>
          </select>
        </div>

        {/* Private Notes */}
        <div>
          <label htmlFor="privateNotes" className="block text-sm font-medium text-gray-700 mb-2">
            Private Notes (Optional)
          </label>
          <p className="text-xs text-gray-500 mb-3">
            These notes are confidential and will only be visible to you and your counsellor.
          </p>
          <textarea
            id="privateNotes"
            rows={4}
            value={privateNotes}
            onChange={(e) => setPrivateNotes(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 resize-none"
            placeholder="Any additional information you'd like your counsellor to know beforehand..."
            maxLength={2000}
          />
          <p className="text-xs text-gray-500 mt-1">{privateNotes.length}/2000 characters</p>
        </div>

        {/* What Happens Next */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
          <div className="space-y-2 text-sm text-blue-800">
            <div className="flex items-start space-x-2">
              <span className="font-medium">1.</span>
              <span>Your booking request will be sent to the counsellor</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-medium">2.</span>
              <span>You'll receive a confirmation email/notification within 30 minutes</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-medium">3.</span>
              <span>
                {appointmentMode === 'chat' && 'You\'ll get a secure chat link to join the session'}
                {appointmentMode === 'video' && 'You\'ll receive a video call link for your session'}
                {appointmentMode === 'in-person' && 'Meeting location details will be confirmed'}
              </span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-medium">4.</span>
              <span>The counsellor will prepare for your session based on your notes</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-medium">5.</span>
              <span>After the session, a summary report will be sent to the admin dashboard (confidentially)</span>
            </div>
          </div>
        </div>

        <div className="flex space-x-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading || !isFormValid()}
            className={`flex-1 py-3 px-4 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
              isFormValid() && !loading 
                ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {t('booking.confirming')}
              </div>
            ) : (
              t('booking.confirmBooking.button')
            )}
          </motion.button>
        </div>
      </form>
    </div>
  );
};

export default Booking;