import { useTranslation } from 'react-i18next'
import { useState } from 'react'

const CrisisModal = ({ isOpen, onClose, crisisType, onContactCounselor }) => {
  const { t } = useTranslation()
  const [isContactingCounselor, setIsContactingCounselor] = useState(false)

  if (!isOpen) return null

  const handleContactCounselor = async () => {
    setIsContactingCounselor(true)
    try {
      await onContactCounselor()
    } catch (error) {
      console.error('Error contacting counselor:', error)
    } finally {
      setIsContactingCounselor(false)
    }
  }

  const emergencyContacts = [
    {
      name: t('crisis.contacts.suicidePrevention'),
      number: '988',
      description: t('crisis.contacts.suicidePreventionDesc'),
      urgent: true
    },
    {
      name: t('crisis.contacts.crisisText'),
      number: 'Text HOME to 741741',
      description: t('crisis.contacts.crisisTextDesc'),
      urgent: true
    },
    {
      name: t('crisis.contacts.emergency'),
      number: '911',
      description: t('crisis.contacts.emergencyDesc'),
      urgent: true
    },
    {
      name: t('crisis.contacts.mentalHealthHotline'),
      number: '1-800-662-4357',
      description: t('crisis.contacts.mentalHealthHotlineDesc'),
      urgent: false
    }
  ]

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-75 transition-opacity" />
      
      {/* Modal */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-pink-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold">
                    {crisisType === 'immediate' ? t('crisis.immediate.title') : t('crisis.escalation.title')}
                  </h2>
                  <p className="text-red-100">
                    {crisisType === 'immediate' ? t('crisis.immediate.subtitle') : t('crisis.escalation.subtitle')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Important Message */}
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-red-800 font-medium">
                    {crisisType === 'immediate' 
                      ? t('crisis.immediate.message')
                      : t('crisis.escalation.message')
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Emergency Contact Counselor Button */}
            <div className="mb-8">
              <button
                onClick={handleContactCounselor}
                disabled={isContactingCounselor}
                className="w-full bg-gradient-to-r from-red-600 to-pink-600 text-white text-xl font-bold py-6 px-8 rounded-xl hover:from-red-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                aria-label={t('crisis.contactCounselor')}
              >
                {isContactingCounselor ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto mb-2"></div>
                    {t('crisis.contactingCounselor')}
                  </>
                ) : (
                  <>
                    <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {t('crisis.contactCounselor')}
                  </>
                )}
              </button>
              <p className="text-center text-gray-600 text-sm mt-2">
                {t('crisis.contactCounselorDesc')}
              </p>
            </div>

            {/* Emergency Contacts */}
            <div className="space-y-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t('crisis.emergencyContacts')}
              </h3>
              
              {emergencyContacts.map((contact, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 ${
                    contact.urgent 
                      ? 'border-red-200 bg-red-50' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className={`font-medium ${
                        contact.urgent ? 'text-red-900' : 'text-gray-900'
                      }`}>
                        {contact.name}
                      </h4>
                      <p className={`text-sm ${
                        contact.urgent ? 'text-red-700' : 'text-gray-600'
                      }`}>
                        {contact.description}
                      </p>
                    </div>
                    <div className="flex-shrink-0 ml-4">
                      <a
                        href={`tel:${contact.number.replace(/\D/g, '')}`}
                        className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                          contact.urgent
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {contact.number}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Safety Resources */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-blue-900 mb-2">
                {t('crisis.safetyResources.title')}
              </h4>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• {t('crisis.safetyResources.stayWith')}</li>
                <li>• {t('crisis.safetyResources.removeHarmful')}</li>
                <li>• {t('crisis.safetyResources.seekImmediate')}</li>
                <li>• {t('crisis.safetyResources.followUp')}</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                {t('crisis.acknowledgeAndContinue')}
              </button>
              <button
                onClick={() => window.location.href = '/resources'}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                {t('crisis.viewMoreResources')}
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <p className="text-center text-gray-600 text-xs">
              {t('crisis.disclaimer')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CrisisModal