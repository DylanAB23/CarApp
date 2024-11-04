import React, { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { Car, Client, BHPHApplication, Employment, Reference } from '../../types';
import { calculateLoanDetails } from '../../utils/financeCalculator';
import { calculateFirstPaymentDate } from '../../utils/dateUtils';
import ClientForm from '../clients/ClientForm';

interface BHPHSaleFormProps {
  car: Car;
  clients: Client[];
  onSubmit: (saleData: any) => void;
  onClose: () => void;
  onClientAdded?: (client: Client) => void;
}

const defaultEmployment: Employment = {
  employer: '',
  position: '',
  yearsEmployed: 0,
  monthlyIncome: 0,
  employerPhone: '',
  employerAddress: ''
};

const defaultReference: Reference = {
  name: '',
  relationship: '',
  phone: '',
  address: ''
};

export default function BHPHSaleForm({ car, clients, onSubmit, onClose, onClientAdded }: BHPHSaleFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [showClientForm, setShowClientForm] = useState(false);
  const [formData, setFormData] = useState({
    carId: car.id,
    clientId: '',
    salePrice: car.price,
    downPayment: Math.round(car.price * 0.1),
    interestRate: 5.9,
    loanTermYears: 3,
    paymentFrequency: 'monthly' as const,
    firstPaymentDate: calculateFirstPaymentDate(new Date(), 'monthly').toISOString().split('T')[0],
    application: {
      employment: defaultEmployment,
      references: [defaultReference],
      previousAddresses: [''],
      yearsAtCurrentAddress: 0,
      monthlyRent: 0,
      otherIncome: {
        source: '',
        amount: 0
      }
    } as BHPHApplication
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      return;
    }

    const loanDetails = calculateLoanDetails({
      vehiclePrice: formData.salePrice,
      downPayment: formData.downPayment,
      interestRate: formData.interestRate,
      loanTermYears: formData.loanTermYears,
      paymentFrequency: formData.paymentFrequency,
    });

    onSubmit({
      ...formData,
      financedAmount: loanDetails.financedAmount,
      paymentAmount: loanDetails.paymentAmount,
      totalPayments: loanDetails.totalPayments,
      startDate: new Date().toISOString(),
      status: 'active',
      saleType: 'bhph'
    });
  };

  const handleClientCreated = async (clientData: Omit<Client, 'id' | 'createdAt'>) => {
    setShowClientForm(false);
    if (onClientAdded) {
      const newClient = await onClientAdded(clientData as Client);
      if (newClient?.id) {
        setFormData(prev => ({ ...prev, clientId: newClient.id }));
      }
    }
  };

  const addReference = () => {
    setFormData(prev => ({
      ...prev,
      application: {
        ...prev.application,
        references: [...prev.application.references, defaultReference]
      }
    }));
  };

  const removeReference = (index: number) => {
    setFormData(prev => ({
      ...prev,
      application: {
        ...prev.application,
        references: prev.application.references.filter((_, i) => i !== index)
      }
    }));
  };

  const addPreviousAddress = () => {
    setFormData(prev => ({
      ...prev,
      application: {
        ...prev.application,
        previousAddresses: [...prev.application.previousAddresses, '']
      }
    }));
  };

  const removePreviousAddress = (index: number) => {
    setFormData(prev => ({
      ...prev,
      application: {
        ...prev.application,
        previousAddresses: prev.application.previousAddresses.filter((_, i) => i !== index)
      }
    }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <h3 className="font-medium text-gray-900 mb-4">Client & Vehicle Information</h3>
            {/* Client Selection */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Select Client</label>
                <button
                  type="button"
                  onClick={() => setShowClientForm(true)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  + Add New Client
                </button>
              </div>
              <select
                value={formData.clientId}
                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="">Choose a client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name} ({client.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Vehicle Details */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h4 className="font-medium mb-2">Vehicle Details</h4>
              <p className="text-sm text-gray-600">
                {car.year} {car.make} {car.model}
              </p>
              <p className="text-sm text-gray-600">
                Stock #: {car.stockNumber}
              </p>
              <p className="text-sm text-gray-600">
                VIN: {car.vin}
              </p>
            </div>
          </>
        );

      case 2:
        return (
          <>
            <h3 className="font-medium text-gray-900 mb-4">Employment Information</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Employer</label>
                  <input
                    type="text"
                    value={formData.application.employment.employer}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      application: {
                        ...prev.application,
                        employment: {
                          ...prev.application.employment,
                          employer: e.target.value
                        }
                      }
                    }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Position</label>
                  <input
                    type="text"
                    value={formData.application.employment.position}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      application: {
                        ...prev.application,
                        employment: {
                          ...prev.application.employment,
                          position: e.target.value
                        }
                      }
                    }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Years Employed</label>
                  <input
                    type="number"
                    value={formData.application.employment.yearsEmployed}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      application: {
                        ...prev.application,
                        employment: {
                          ...prev.application.employment,
                          yearsEmployed: Number(e.target.value)
                        }
                      }
                    }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                    min="0"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Monthly Income</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      value={formData.application.employment.monthlyIncome}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        application: {
                          ...prev.application,
                          employment: {
                            ...prev.application.employment,
                            monthlyIncome: Number(e.target.value)
                          }
                        }
                      }))}
                      className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                      min="0"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Employer Phone</label>
                <input
                  type="tel"
                  value={formData.application.employment.employerPhone}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    application: {
                      ...prev.application,
                      employment: {
                        ...prev.application.employment,
                        employerPhone: e.target.value
                      }
                    }
                  }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Employer Address</label>
                <input
                  type="text"
                  value={formData.application.employment.employerAddress}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    application: {
                      ...prev.application,
                      employment: {
                        ...prev.application.employment,
                        employerAddress: e.target.value
                      }
                    }
                  }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </>
        );

      case 3:
        return (
          <>
            <h3 className="font-medium text-gray-900 mb-4">References</h3>
            <div className="space-y-6">
              {formData.application.references.map((reference, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium">Reference #{index + 1}</h4>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeReference(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      <input
                        type="text"
                        value={reference.name}
                        onChange={(e) => {
                          const newReferences = [...formData.application.references];
                          newReferences[index] = { ...reference, name: e.target.value };
                          setFormData(prev => ({
                            ...prev,
                            application: {
                              ...prev.application,
                              references: newReferences
                            }
                          }));
                        }}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Relationship</label>
                      <input
                        type="text"
                        value={reference.relationship}
                        onChange={(e) => {
                          const newReferences = [...formData.application.references];
                          newReferences[index] = { ...reference, relationship: e.target.value };
                          setFormData(prev => ({
                            ...prev,
                            application: {
                              ...prev.application,
                              references: newReferences
                            }
                          }));
                        }}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <input
                        type="tel"
                        value={reference.phone}
                        onChange={(e) => {
                          const newReferences = [...formData.application.references];
                          newReferences[index] = { ...reference, phone: e.target.value };
                          setFormData(prev => ({
                            ...prev,
                            application: {
                              ...prev.application,
                              references: newReferences
                            }
                          }));
                        }}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Address</label>
                      <input
                        type="text"
                        value={reference.address}
                        onChange={(e) => {
                          const newReferences = [...formData.application.references];
                          newReferences[index] = { ...reference, address: e.target.value };
                          setFormData(prev => ({
                            ...prev,
                            application: {
                              ...prev.application,
                              references: newReferences
                            }
                          }));
                        }}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addReference}
                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-500 transition-colors"
              >
                <Plus className="w-5 h-5 mx-auto" />
              </button>
            </div>
          </>
        );

      case 4:
        return (
          <>
            <h3 className="font-medium text-gray-900 mb-4">Payment Terms</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Sale Price</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      value={formData.salePrice}
                      onChange={(e) => setFormData({ ...formData, salePrice: Number(e.target.value) })}
                      className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                      min={0}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Down Payment</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      value={formData.downPayment}
                      onChange={(e) => setFormData({ ...formData, downPayment: Number(e.target.value) })}
                      className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                      min={0}
                      max={formData.salePrice}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Interest Rate (%)</label>
                  <input
                    type="number"
                    value={formData.interestRate}
                    onChange={(e) => setFormData({ ...formData, interestRate: Number(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                    step="0.1"
                    min={0}
                    max={30}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Loan Term</label>
                  <select
                    value={formData.loanTermYears}
                    onChange={(e) => setFormData({ ...formData, loanTermYears: Number(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  >
                    {[1, 2, 3, 4, 5].map((years) => (
                      <option key={years} value={years}>
                        {years} {years === 1 ? 'Year' : 'Years'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Payment Frequency</label>
                  <select
                    value={formData.paymentFrequency}
                    onChange={(e) => setFormData({ ...formData, paymentFrequency: e.target.value as any })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  >
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Payment Date</label>
                  <input
                    type="date"
                    value={formData.firstPaymentDate}
                    onChange={(e) => setFormData({ ...formData, firstPaymentDate: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                    min={calculateFirstPaymentDate(new Date(), formData.paymentFrequency).toISOString().split('T')[0]}
                  />
                </div>
              </div>

              {/* Payment Preview */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Payment Preview</h4>
                {(() => {
                  const loanDetails = calculateLoanDetails({
                    vehiclePrice: formData.salePrice,
                    downPayment: formData.downPayment,
                    interestRate: formData.interestRate,
                    loanTermYears: formData.loanTermYears,
                    paymentFrequency: formData.paymentFrequency,
                  });

                  return (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Vehicle Price: ${formData.salePrice.toLocaleString()}</p>
                        <p className="text-gray-600">Down Payment: ${formData.downPayment.toLocaleString()}</p>
                        <p className="text-gray-600">Financed Amount: ${loanDetails.financedAmount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">
                          {formData.paymentFrequency.charAt(0).toUpperCase() + formData.paymentFrequency.slice(1)} Payment: ${loanDetails.paymentAmount.toLocaleString()}
                        </p>
                        <p className="text-gray-600">Total Payments: {loanDetails.totalPayments}</p>
                        <p className="text-gray-600">Total Interest: ${loanDetails.totalInterest.toLocaleString()}</p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-3xl p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold">Buy Here Pay Here Application</h2>
            <p className="text-sm text-gray-600">Step {currentStep} of 4</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {renderStepContent()}

          <div className="flex justify-between pt-6 border-t">
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep - 1)}
              className={`px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 ${
                currentStep === 1 ? 'invisible' : ''
              }`}
            >
              Previous
            </button>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {currentStep === 4 ? 'Create Sale' : 'Next'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {showClientForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
          <ClientForm
            onSubmit={handleClientCreated}
            onClose={() => setShowClientForm(false)}
          />
        </div>
      )}
    </div>
  );
}