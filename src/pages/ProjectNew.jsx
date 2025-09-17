import { useState } from 'react';
import { 
  ArrowLeft,
  Save,
  Plus,
  X,
  Calendar,
  DollarSign,
  MapPin,
  Building,
  Users,
  FileText,
  Upload,
  AlertTriangle,
  Check
} from 'lucide-react';
import { Link } from 'react-router-dom';

const projectCategories = [
  'Transportation',
  'Healthcare',
  'Education', 
  'Water & Sanitation',
  'Housing',
  'Agriculture',
  'Energy',
  'ICT',
  'Tourism',
  'Environment'
];

const lgas = [
  'Aba North', 'Aba South', 'Arochukwu', 'Bende', 'Ikwuano', 'Isiala Ngwa North',
  'Isiala Ngwa South', 'Isuikwuato', 'Obi Ngwa', 'Ohafia', 'Osisioma', 'Ugwunagbo',
  'Ukwa East', 'Ukwa West', 'Umuahia North', 'Umuahia South', 'Umu Nneochi'
];

const priorities = ['Low', 'Medium', 'High', 'Critical'];
const fundingSources = ['State Budget', 'Federal Grant', 'World Bank', 'USAID', 'EU Grant', 'Private Partnership'];

export default function ProjectNew() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    lga: '',
    priority: 'Medium',
    budget: '',
    fundingSource: '',
    startDate: '',
    expectedEndDate: '',
    contractor: '',
    projectManager: '',
    beneficiaries: '',
    objectives: [''],
    milestones: [{ name: '', description: '', dueDate: '', budget: '' }],
    attachments: []
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});

  const steps = [
    { id: 1, name: 'Basic Information', icon: FileText },
    { id: 2, name: 'Budget & Timeline', icon: Calendar },
    { id: 3, name: 'Team & Stakeholders', icon: Users },
    { id: 4, name: 'Objectives & Milestones', icon: Plus },
    { id: 5, name: 'Review & Submit', icon: Check }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleObjectiveChange = (index, value) => {
    const newObjectives = [...formData.objectives];
    newObjectives[index] = value;
    setFormData(prev => ({
      ...prev,
      objectives: newObjectives
    }));
  };

  const addObjective = () => {
    setFormData(prev => ({
      ...prev,
      objectives: [...prev.objectives, '']
    }));
  };

  const removeObjective = (index) => {
    if (formData.objectives.length > 1) {
      const newObjectives = formData.objectives.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        objectives: newObjectives
      }));
    }
  };

  const handleMilestoneChange = (index, field, value) => {
    const newMilestones = [...formData.milestones];
    newMilestones[index][field] = value;
    setFormData(prev => ({
      ...prev,
      milestones: newMilestones
    }));
  };

  const addMilestone = () => {
    setFormData(prev => ({
      ...prev,
      milestones: [...prev.milestones, { name: '', description: '', dueDate: '', budget: '' }]
    }));
  };

  const removeMilestone = (index) => {
    if (formData.milestones.length > 1) {
      const newMilestones = formData.milestones.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        milestones: newMilestones
      }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.name) newErrors.name = 'Project name is required';
      if (!formData.description) newErrors.description = 'Project description is required';
      if (!formData.category) newErrors.category = 'Project category is required';
      if (!formData.lga) newErrors.lga = 'LGA is required';
    }

    if (step === 2) {
      if (!formData.budget) newErrors.budget = 'Budget is required';
      if (!formData.startDate) newErrors.startDate = 'Start date is required';
      if (!formData.expectedEndDate) newErrors.expectedEndDate = 'Expected end date is required';
      if (!formData.fundingSource) newErrors.fundingSource = 'Funding source is required';
    }

    if (step === 3) {
      if (!formData.contractor) newErrors.contractor = 'Contractor is required';
      if (!formData.projectManager) newErrors.projectManager = 'Project manager is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    if (validateStep(currentStep)) {
      console.log('Submitting project:', formData);
      // Here you would typically send the data to your API
      alert('Project created successfully!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/projects" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add New Project</h1>
            <p className="text-gray-600">Create a new project in the Abia Project Tracker system.</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Link to="/projects" className="btn-secondary">
            Cancel
          </Link>
          <button 
            onClick={currentStep === steps.length ? handleSubmit : nextStep}
            className="btn-primary flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>{currentStep === steps.length ? 'Create Project' : 'Next Step'}</span>
          </button>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="card">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center space-x-2 ${
                  isActive ? 'text-abia-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isActive ? 'bg-abia-100' : isCompleted ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    {isCompleted ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>
                  <span className="text-sm font-medium hidden sm:block">{step.name}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-4 ${
                    isCompleted ? 'bg-green-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Content */}
      <div className="card">
        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-abia-500 focus:border-transparent ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter project name"
                />
                {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-abia-500 focus:border-transparent ${
                    errors.description ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Describe the project objectives, scope, and expected outcomes"
                />
                {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-abia-500 focus:border-transparent ${
                    errors.category ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select category</option>
                  {projectCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                {errors.category && <p className="text-red-600 text-sm mt-1">{errors.category}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Local Government Area *
                </label>
                <select
                  value={formData.lga}
                  onChange={(e) => handleInputChange('lga', e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-abia-500 focus:border-transparent ${
                    errors.lga ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select LGA</option>
                  {lgas.map(lga => (
                    <option key={lga} value={lga}>{lga}</option>
                  ))}
                </select>
                {errors.lga && <p className="text-red-600 text-sm mt-1">{errors.lga}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority Level
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-abia-500 focus:border-transparent"
                >
                  {priorities.map(priority => (
                    <option key={priority} value={priority}>{priority}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expected Beneficiaries
                </label>
                <input
                  type="text"
                  value={formData.beneficiaries}
                  onChange={(e) => handleInputChange('beneficiaries', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-abia-500 focus:border-transparent"
                  placeholder="e.g., 50,000 residents"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Budget & Timeline */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Budget & Timeline</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Budget (₦) *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => handleInputChange('budget', e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-abia-500 focus:border-transparent ${
                      errors.budget ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                </div>
                {errors.budget && <p className="text-red-600 text-sm mt-1">{errors.budget}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Funding Source *
                </label>
                <select
                  value={formData.fundingSource}
                  onChange={(e) => handleInputChange('fundingSource', e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-abia-500 focus:border-transparent ${
                    errors.fundingSource ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select funding source</option>
                  {fundingSources.map(source => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </select>
                {errors.fundingSource && <p className="text-red-600 text-sm mt-1">{errors.fundingSource}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-abia-500 focus:border-transparent ${
                      errors.startDate ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.startDate && <p className="text-red-600 text-sm mt-1">{errors.startDate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expected End Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    value={formData.expectedEndDate}
                    onChange={(e) => handleInputChange('expectedEndDate', e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-abia-500 focus:border-transparent ${
                      errors.expectedEndDate ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.expectedEndDate && <p className="text-red-600 text-sm mt-1">{errors.expectedEndDate}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Team & Stakeholders */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Team & Stakeholders</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contractor *
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.contractor}
                    onChange={(e) => handleInputChange('contractor', e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-abia-500 focus:border-transparent ${
                      errors.contractor ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Contractor company name"
                  />
                </div>
                {errors.contractor && <p className="text-red-600 text-sm mt-1">{errors.contractor}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Manager *
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.projectManager}
                    onChange={(e) => handleInputChange('projectManager', e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-abia-500 focus:border-transparent ${
                      errors.projectManager ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Project manager name"
                  />
                </div>
                {errors.projectManager && <p className="text-red-600 text-sm mt-1">{errors.projectManager}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Objectives & Milestones */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Objectives & Milestones</h3>
            
            {/* Objectives */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Project Objectives
                </label>
                <button
                  type="button"
                  onClick={addObjective}
                  className="btn-secondary text-sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Objective
                </button>
              </div>
              <div className="space-y-3">
                {formData.objectives.map((objective, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <input
                      type="text"
                      value={objective}
                      onChange={(e) => handleObjectiveChange(index, e.target.value)}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-abia-500 focus:border-transparent"
                      placeholder={`Objective ${index + 1}`}
                    />
                    {formData.objectives.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeObjective(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Milestones */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Project Milestones
                </label>
                <button
                  type="button"
                  onClick={addMilestone}
                  className="btn-secondary text-sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Milestone
                </button>
              </div>
              <div className="space-y-4">
                {formData.milestones.map((milestone, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-900">Milestone {index + 1}</h4>
                      {formData.milestones.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMilestone(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <input
                          type="text"
                          value={milestone.name}
                          onChange={(e) => handleMilestoneChange(index, 'name', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-abia-500 focus:border-transparent"
                          placeholder="Milestone name"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <textarea
                          value={milestone.description}
                          onChange={(e) => handleMilestoneChange(index, 'description', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-abia-500 focus:border-transparent"
                          rows={2}
                          placeholder="Milestone description"
                        />
                      </div>
                      <div>
                        <input
                          type="date"
                          value={milestone.dueDate}
                          onChange={(e) => handleMilestoneChange(index, 'dueDate', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-abia-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          value={milestone.budget}
                          onChange={(e) => handleMilestoneChange(index, 'budget', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-abia-500 focus:border-transparent"
                          placeholder="Milestone budget"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Review & Submit */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Review & Submit</h3>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">Project Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Name:</span>
                  <p className="text-gray-900">{formData.name || 'Not specified'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Category:</span>
                  <p className="text-gray-900">{formData.category || 'Not specified'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">LGA:</span>
                  <p className="text-gray-900">{formData.lga || 'Not specified'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Budget:</span>
                  <p className="text-gray-900">₦{formData.budget ? Number(formData.budget).toLocaleString() : '0'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Start Date:</span>
                  <p className="text-gray-900">{formData.startDate || 'Not specified'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">End Date:</span>
                  <p className="text-gray-900">{formData.expectedEndDate || 'Not specified'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Contractor:</span>
                  <p className="text-gray-900">{formData.contractor || 'Not specified'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Project Manager:</span>
                  <p className="text-gray-900">{formData.projectManager || 'Not specified'}</p>
                </div>
              </div>
              
              {formData.description && (
                <div className="mt-4">
                  <span className="font-medium text-gray-700">Description:</span>
                  <p className="text-gray-900 mt-1">{formData.description}</p>
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900">Before you submit</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Please review all information carefully. Once submitted, this project will be added to the system and notifications will be sent to relevant stakeholders.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`btn-secondary ${currentStep === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Previous
          </button>
          
          <span className="text-sm text-gray-500">
            Step {currentStep} of {steps.length}
          </span>
          
          <button
            onClick={currentStep === steps.length ? handleSubmit : nextStep}
            className="btn-primary"
          >
            {currentStep === steps.length ? 'Create Project' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
