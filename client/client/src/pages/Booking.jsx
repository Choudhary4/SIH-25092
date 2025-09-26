import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useApi } from '../hooks/useApi';

const Booking = () => {
  const { t } = useTranslation();
  const { callApi } = useApi();

  // State management for the booking flow
  const [step, setStep] = useState(1); // 1: Select Counsellor, 2: Select Slot, 3: Booking Form
  const [counsellors, setCounsellors] = useState([]);
  const [selectedCounsellor, setSelectedCounsellor] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
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
      const response = await callApi('/api/v1/counsellors', 'GET');
      if (response.success) {
        setCounsellors(response.data || []);
      } else {
        setError('Failed to load counsellors. Please try again.');
      }
    } catch (err) {
      console.error('Error fetching counsellors:', err);
      setError('Failed to load counsellors. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async (counsellorId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await callApi(`/api/v1/counsellors/${counsellorId}/slots`, 'GET');
      if (response.success) {
        setAvailableSlots(response.data || []);
        setStep(2);
      } else {
        setError('Failed to load available slots. Please try again.');
      }
    } catch (err) {
      console.error('Error fetching slots:', err);
      setError('Failed to load available slots. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCounsellorSelect = (counsellor) => {
    setSelectedCounsellor(counsellor);
    fetchAvailableSlots(counsellor.id);
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setStep(3);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const bookingData = {
        counsellorId: selectedCounsellor.id,
        slotStart: selectedSlot.startTime,
        slotEnd: selectedSlot.endTime,
        mode: appointmentMode,
        reason: appointmentReason.trim() || 'General counselling session',
        urgency: appointmentUrgency,
        location: appointmentMode === 'in-person' ? location.trim() : undefined,
        privateNotes: privateNotes.trim() || undefined
      };

      const response = await callApi('/api/v1/appointments', 'POST', bookingData);
      if (response.success) {
        setBookingSuccess(true);
        // Reset form after successful booking
        setTimeout(() => {
          resetBookingFlow();
        }, 3000);
      } else {
        setError(response.message || 'Failed to book appointment. Please try again.');
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
    setAvailableSlots([]);
    setSelectedSlot(null);
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
      setAvailableSlots([]);
    } else if (step === 3) {
      setStep(2);
      setSelectedSlot(null);
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('booking.success.title')}</h2>
            <p className="text-gray-600 mb-6">{t('booking.success.message')}</p>
            <p className="text-sm text-gray-500">{t('booking.success.autoRedirect')}</p>
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
              {step === 1 && t('booking.steps.selectCounsellor')}
              {step === 2 && t('booking.steps.selectSlot')}
              {step === 3 && t('booking.steps.confirmBooking')}
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
                {t('common.back')}
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

            {/* Step 2: Select Slot */}
            {step === 2 && selectedCounsellor && (
              <SlotSelection
                counsellor={selectedCounsellor}
                slots={availableSlots}
                loading={loading}
                onSelect={handleSlotSelect}
                formatDate={formatDate}
                formatTime={formatTime}
                t={t}
              />
            )}

            {/* Step 3: Booking Form */}
            {step === 3 && selectedCounsellor && selectedSlot && (
              <BookingForm
                counsellor={selectedCounsellor}
                slot={selectedSlot}
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

// Slot Selection Component
const SlotSelection = ({ counsellor, slots, loading, onSelect, formatDate, formatTime, t }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-gray-600">{t('booking.loading.slots')}</span>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 6v6m-4-6h8m-4-6V3m0 10h.01" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">{t('booking.noSlots.title')}</h3>
        <p className="text-gray-600">{t('booking.noSlots.message')}</p>
      </div>
    );
  }

  // Group slots by date
  const groupedSlots = slots.reduce((groups, slot) => {
    const date = formatDate(slot.startTime);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(slot);
    return groups;
  }, {});

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">{t('booking.selectSlot.title')}</h2>
        <p className="text-gray-600 mt-1">{t('booking.selectSlot.counsellor')}: {counsellor.name}</p>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedSlots).map(([date, dateSlots]) => (
          <div key={date}>
            <h3 className="text-lg font-medium text-gray-900 mb-3">{date}</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {dateSlots.map((slot) => (
                <motion.button
                  key={slot.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSelect(slot)}
                  className="border border-gray-200 rounded-lg p-4 text-left hover:border-indigo-300 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">{slot.duration} {t('booking.minutes')}</p>
                      {slot.type && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-2">
                          {slot.type}
                        </span>
                      )}
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Booking Form Component
const BookingForm = ({ 
  counsellor, 
  slot, 
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
        <h3 className="font-medium text-gray-900 mb-3">{t('booking.summary.title')}</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">{t('booking.summary.counsellor')}:</span>
            <span className="font-medium">{counsellor.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">{t('booking.summary.date')}:</span>
            <span className="font-medium">{formatDate(slot.startTime)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">{t('booking.summary.time')}:</span>
            <span className="font-medium">{formatTime(slot.startTime)} - {formatTime(slot.endTime)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">{t('booking.summary.duration')}:</span>
            <span className="font-medium">{slot.duration} {t('booking.minutes')}</span>
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

export default Booking