/**
 * Dynamic Form Components System
 * Provides reusable form components for CRUD operations
 */
class FormBuilder {
  constructor() {
    this.validators = new Map();
    this.components = new Map();
    this.forms = new Map();
    
    this.registerDefaultValidators();
    this.registerDefaultComponents();
    this.loadStyles();
  }

  loadStyles() {
    if (document.getElementById('form-builder-styles')) return;
    
    const formBuilderStyles = `
      .form-builder {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        padding: 24px;
      }

      .form-group {
        margin-bottom: 20px;
      }

      .form-label {
        display: block;
        margin-bottom: 6px;
        font-weight: 600;
        color: var(--text-primary);
        font-size: 14px;
      }

      .form-label.required::after {
        content: ' *';
        color: #ef4444;
      }

      .form-input,
      .form-textarea,
      .form-select {
        width: 100%;
        padding: 12px 16px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.05);
        color: var(--text-primary);
        font-size: 14px;
        transition: all 0.3s ease;
        font-family: inherit;
      }

      .form-input::placeholder,
      .form-textarea::placeholder {
        color: var(--text-muted);
      }

      .form-input:focus,
      .form-textarea:focus,
      .form-select:focus {
        outline: none;
        border-color: var(--glass-primary);
        background: rgba(255, 255, 255, 0.1);
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
      }

      .form-input.error,
      .form-textarea.error,
      .form-select.error {
        border-color: #ef4444;
        background: rgba(239, 68, 68, 0.05);
      }

      .form-error {
        color: #ef4444;
        font-size: 12px;
        margin-top: 4px;
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .form-help {
        color: var(--text-muted);
        font-size: 12px;
        margin-top: 4px;
      }

      .form-textarea {
        resize: vertical;
        min-height: 80px;
      }

      .form-checkbox-group,
      .form-radio-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .form-checkbox-item,
      .form-radio-item {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .form-checkbox,
      .form-radio {
        width: 16px;
        height: 16px;
        accent-color: var(--glass-primary);
      }

      .form-file-input {
        position: relative;
        overflow: hidden;
        display: inline-block;
        width: 100%;
      }

      .form-file-input input[type="file"] {
        position: absolute;
        left: -9999px;
      }

      .form-file-label {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 12px 16px;
        border: 2px dashed rgba(255, 255, 255, 0.3);
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.02);
        cursor: pointer;
        transition: all 0.3s ease;
        color: var(--text-secondary);
      }

      .form-file-label:hover,
      .form-file-input.drag-over .form-file-label {
        border-color: var(--glass-primary);
        background: rgba(99, 102, 241, 0.05);
        color: var(--glass-primary);
      }

      .form-file-preview {
        margin-top: 8px;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .form-file-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 10px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 6px;
        font-size: 12px;
      }

      .form-file-remove {
        cursor: pointer;
        color: #ef4444;
        font-weight: bold;
      }

      .form-date-time {
        display: grid;
        grid-template-columns: 1fr 100px;
        gap: 8px;
      }

      .form-color-input {
        display: flex;
        gap: 8px;
        align-items: center;
      }

      .form-color-preview {
        width: 40px;
        height: 40px;
        border-radius: 6px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        cursor: pointer;
      }

      .form-tags-input {
        position: relative;
      }

      .form-tags-container {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        min-height: 44px;
        padding: 8px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.05);
        cursor: text;
      }

      .form-tag {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 4px 8px;
        background: var(--glass-primary);
        color: white;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;
      }

      .form-tag-remove {
        cursor: pointer;
        color: rgba(255, 255, 255, 0.8);
        font-size: 14px;
        line-height: 1;
      }

      .form-tag-remove:hover {
        color: white;
      }

      .form-tag-input {
        flex: 1;
        min-width: 100px;
        border: none;
        background: transparent;
        outline: none;
        color: var(--text-primary);
        font-size: 14px;
      }

      .form-tags-suggestions {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: rgba(0, 0, 0, 0.9);
        backdrop-filter: blur(10px);
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        max-height: 200px;
        overflow-y: auto;
        z-index: 100;
        margin-top: 4px;
      }

      .form-tags-suggestion {
        padding: 8px 12px;
        cursor: pointer;
        font-size: 14px;
        color: var(--text-secondary);
        transition: all 0.2s ease;
      }

      .form-tags-suggestion:hover,
      .form-tags-suggestion.selected {
        background: rgba(255, 255, 255, 0.1);
        color: var(--text-primary);
      }

      .form-slider {
        position: relative;
        margin: 16px 0;
      }

      .form-slider-track {
        width: 100%;
        height: 6px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 3px;
        position: relative;
      }

      .form-slider-fill {
        height: 100%;
        background: var(--glass-primary);
        border-radius: 3px;
        transition: width 0.2s ease;
      }

      .form-slider-thumb {
        width: 20px;
        height: 20px;
        background: var(--glass-primary);
        border: 2px solid white;
        border-radius: 50%;
        position: absolute;
        top: 50%;
        transform: translate(-50%, -50%);
        cursor: pointer;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        transition: all 0.2s ease;
      }

      .form-slider-thumb:hover {
        transform: translate(-50%, -50%) scale(1.1);
      }

      .form-slider-value {
        text-align: center;
        font-size: 12px;
        color: var(--text-muted);
        margin-top: 8px;
      }

      .form-actions {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
        margin-top: 24px;
        padding-top: 20px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
      }

      .form-section {
        margin-bottom: 32px;
      }

      .form-section-title {
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 16px;
        padding-bottom: 8px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .form-row {
        display: grid;
        gap: 16px;
        margin-bottom: 20px;
      }

      .form-row.cols-2 {
        grid-template-columns: 1fr 1fr;
      }

      .form-row.cols-3 {
        grid-template-columns: 1fr 1fr 1fr;
      }

      .form-loading {
        position: relative;
        pointer-events: none;
      }

      .form-loading::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(2px);
        border-radius: inherit;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .form-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(5px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 20px;
      }

      .form-modal-content {
        background: rgba(0, 0, 0, 0.9);
        backdrop-filter: blur(20px);
        border-radius: 16px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        width: 100%;
        max-width: 600px;
        max-height: 90vh;
        overflow-y: auto;
      }

      .form-modal-header {
        padding: 20px 24px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .form-modal-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--text-primary);
        margin: 0;
      }

      .form-modal-close {
        background: none;
        border: none;
        font-size: 24px;
        color: var(--text-secondary);
        cursor: pointer;
        padding: 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 6px;
        transition: all 0.2s ease;
      }

      .form-modal-close:hover {
        background: rgba(255, 255, 255, 0.1);
        color: var(--text-primary);
      }

      .form-modal-body {
        padding: 24px;
      }

      /* Responsive */
      @media (max-width: 768px) {
        .form-modal {
          padding: 10px;
        }

        .form-modal-content {
          max-width: 100%;
        }

        .form-row.cols-2,
        .form-row.cols-3 {
          grid-template-columns: 1fr;
        }

        .form-date-time {
          grid-template-columns: 1fr;
        }

        .form-actions {
          flex-direction: column;
        }
      }
    `;

    // Use StyleLoader if available, otherwise fallback to direct injection
    if (window.StyleLoader) {
      window.StyleLoader.injectStyles('form-builder-styles', formBuilderStyles);
    } else {
      // Fallback for when StyleLoader is not available
      if (!document.getElementById('form-builder-styles')) {
        const styleEl = document.createElement('style');
        styleEl.id = 'form-builder-styles';
        styleEl.textContent = formBuilderStyles;
        document.head.appendChild(styleEl);
      }
    }
  }

  registerDefaultValidators() {
    this.validators.set('required', (value) => {
      if (value === null || value === undefined || value === '') {
        return 'This field is required';
      }
      return null;
    });

    this.validators.set('email', (value) => {
      if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return 'Please enter a valid email address';
      }
      return null;
    });

    this.validators.set('minLength', (value, min) => {
      if (value && value.length < min) {
        return `Must be at least ${min} characters long`;
      }
      return null;
    });

    this.validators.set('maxLength', (value, max) => {
      if (value && value.length > max) {
        return `Must be no more than ${max} characters long`;
      }
      return null;
    });

    this.validators.set('min', (value, min) => {
      if (value !== '' && parseFloat(value) < min) {
        return `Must be at least ${min}`;
      }
      return null;
    });

    this.validators.set('max', (value, max) => {
      if (value !== '' && parseFloat(value) > max) {
        return `Must be no more than ${max}`;
      }
      return null;
    });

    this.validators.set('pattern', (value, pattern) => {
      if (value && !new RegExp(pattern).test(value)) {
        return 'Please enter a valid value';
      }
      return null;
    });
  }

  registerDefaultComponents() {
    this.components.set('text', this.renderTextInput.bind(this));
    this.components.set('email', this.renderEmailInput.bind(this));
    this.components.set('password', this.renderPasswordInput.bind(this));
    this.components.set('number', this.renderNumberInput.bind(this));
    this.components.set('textarea', this.renderTextarea.bind(this));
    this.components.set('select', this.renderSelect.bind(this));
    this.components.set('checkbox', this.renderCheckbox.bind(this));
    this.components.set('radio', this.renderRadio.bind(this));
    this.components.set('file', this.renderFileInput.bind(this));
    this.components.set('date', this.renderDateInput.bind(this));
    this.components.set('datetime', this.renderDateTimeInput.bind(this));
    this.components.set('color', this.renderColorInput.bind(this));
    this.components.set('tags', this.renderTagsInput.bind(this));
    this.components.set('slider', this.renderSlider.bind(this));
    this.components.set('hidden', this.renderHiddenInput.bind(this));
  }

  createForm(config) {
    const formId = config.id || `form_${Date.now()}`;
    const form = new DynamicForm(formId, config, this);
    this.forms.set(formId, form);
    return form;
  }

  showModal(config) {
    const modal = document.createElement('div');
    modal.className = 'form-modal';
    modal.innerHTML = `
      <div class="form-modal-content">
        <div class="form-modal-header">
          <h3 class="form-modal-title">${config.title || 'Form'}</h3>
          <button class="form-modal-close" onclick="this.closest('.form-modal').remove()">×</button>
        </div>
        <div class="form-modal-body" id="modal-form-container-${Date.now()}">
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const container = modal.querySelector('.form-modal-body');
    const form = this.createForm({
      ...config,
      container,
      onSubmit: async (data) => {
        if (config.onSubmit) {
          await config.onSubmit(data);
        }
        modal.remove();
      },
      onCancel: () => {
        modal.remove();
      }
    });

    form.render();
    return { modal, form };
  }

  // Component renderers
  renderTextInput(field, value = '') {
    return `
      <input 
        type="text" 
        class="form-input" 
        name="${field.name}"
        id="${field.id || field.name}"
        value="${this.escapeHtml(value)}"
        placeholder="${field.placeholder || ''}"
        ${field.required ? 'required' : ''}
        ${field.readonly ? 'readonly' : ''}
        ${field.disabled ? 'disabled' : ''}
        ${field.maxlength ? `maxlength="${field.maxlength}"` : ''}
      />
    `;
  }

  renderEmailInput(field, value = '') {
    return `
      <input 
        type="email" 
        class="form-input" 
        name="${field.name}"
        id="${field.id || field.name}"
        value="${this.escapeHtml(value)}"
        placeholder="${field.placeholder || 'Enter email address'}"
        ${field.required ? 'required' : ''}
        ${field.readonly ? 'readonly' : ''}
        ${field.disabled ? 'disabled' : ''}
      />
    `;
  }

  renderPasswordInput(field, value = '') {
    return `
      <input 
        type="password" 
        class="form-input" 
        name="${field.name}"
        id="${field.id || field.name}"
        value="${this.escapeHtml(value)}"
        placeholder="${field.placeholder || 'Enter password'}"
        ${field.required ? 'required' : ''}
        ${field.readonly ? 'readonly' : ''}
        ${field.disabled ? 'disabled' : ''}
      />
    `;
  }

  renderNumberInput(field, value = '') {
    return `
      <input 
        type="number" 
        class="form-input" 
        name="${field.name}"
        id="${field.id || field.name}"
        value="${value}"
        placeholder="${field.placeholder || ''}"
        ${field.required ? 'required' : ''}
        ${field.readonly ? 'readonly' : ''}
        ${field.disabled ? 'disabled' : ''}
        ${field.min !== undefined ? `min="${field.min}"` : ''}
        ${field.max !== undefined ? `max="${field.max}"` : ''}
        ${field.step !== undefined ? `step="${field.step}"` : ''}
      />
    `;
  }

  renderTextarea(field, value = '') {
    return `
      <textarea 
        class="form-textarea" 
        name="${field.name}"
        id="${field.id || field.name}"
        placeholder="${field.placeholder || ''}"
        ${field.required ? 'required' : ''}
        ${field.readonly ? 'readonly' : ''}
        ${field.disabled ? 'disabled' : ''}
        rows="${field.rows || 4}"
      >${this.escapeHtml(value)}</textarea>
    `;
  }

  renderSelect(field, value = '') {
    const options = field.options || [];
    return `
      <select 
        class="form-select" 
        name="${field.name}"
        id="${field.id || field.name}"
        ${field.required ? 'required' : ''}
        ${field.disabled ? 'disabled' : ''}
        ${field.multiple ? 'multiple' : ''}
      >
        ${!field.required && !field.multiple ? '<option value="">Select an option</option>' : ''}
        ${options.map(option => {
          const optionValue = typeof option === 'object' ? option.value : option;
          const optionLabel = typeof option === 'object' ? option.label : option;
          const selected = Array.isArray(value) 
            ? value.includes(optionValue) 
            : value == optionValue;
          return `<option value="${optionValue}" ${selected ? 'selected' : ''}>${optionLabel}</option>`;
        }).join('')}
      </select>
    `;
  }

  renderCheckbox(field, value = []) {
    const options = field.options || [];
    const values = Array.isArray(value) ? value : [value];
    
    return `
      <div class="form-checkbox-group">
        ${options.map(option => {
          const optionValue = typeof option === 'object' ? option.value : option;
          const optionLabel = typeof option === 'object' ? option.label : option;
          const checked = values.includes(optionValue);
          return `
            <div class="form-checkbox-item">
              <input 
                type="checkbox" 
                class="form-checkbox"
                name="${field.name}[]"
                value="${optionValue}"
                ${checked ? 'checked' : ''}
                ${field.disabled ? 'disabled' : ''}
              />
              <label>${optionLabel}</label>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  renderRadio(field, value = '') {
    const options = field.options || [];
    
    return `
      <div class="form-radio-group">
        ${options.map(option => {
          const optionValue = typeof option === 'object' ? option.value : option;
          const optionLabel = typeof option === 'object' ? option.label : option;
          const checked = value == optionValue;
          return `
            <div class="form-radio-item">
              <input 
                type="radio" 
                class="form-radio"
                name="${field.name}"
                value="${optionValue}"
                ${checked ? 'checked' : ''}
                ${field.disabled ? 'disabled' : ''}
              />
              <label>${optionLabel}</label>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  renderFileInput(field, value = []) {
    const files = Array.isArray(value) ? value : [];
    
    return `
      <div class="form-file-input" data-field="${field.name}">
        <input 
          type="file" 
          name="${field.name}"
          id="${field.id || field.name}"
          ${field.multiple ? 'multiple' : ''}
          ${field.accept ? `accept="${field.accept}"` : ''}
          ${field.disabled ? 'disabled' : ''}
        />
        <label for="${field.id || field.name}" class="form-file-label">
          <span>📁</span>
          <span>${field.multiple ? 'Choose files' : 'Choose file'}</span>
        </label>
        ${files.length > 0 ? `
          <div class="form-file-preview">
            ${files.map(file => `
              <div class="form-file-item">
                <span>${file.name || file}</span>
                <span class="form-file-remove" onclick="this.parentElement.remove()">×</span>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }

  renderDateInput(field, value = '') {
    return `
      <input 
        type="date" 
        class="form-input" 
        name="${field.name}"
        id="${field.id || field.name}"
        value="${value}"
        ${field.required ? 'required' : ''}
        ${field.readonly ? 'readonly' : ''}
        ${field.disabled ? 'disabled' : ''}
        ${field.min ? `min="${field.min}"` : ''}
        ${field.max ? `max="${field.max}"` : ''}
      />
    `;
  }

  renderDateTimeInput(field, value = '') {
    const [date, time] = value.split('T');
    
    return `
      <div class="form-date-time">
        <input 
          type="date" 
          class="form-input" 
          name="${field.name}_date"
          value="${date || ''}"
          ${field.required ? 'required' : ''}
          ${field.readonly ? 'readonly' : ''}
          ${field.disabled ? 'disabled' : ''}
        />
        <input 
          type="time" 
          class="form-input" 
          name="${field.name}_time"
          value="${time || ''}"
          ${field.readonly ? 'readonly' : ''}
          ${field.disabled ? 'disabled' : ''}
        />
      </div>
    `;
  }

  renderColorInput(field, value = '#000000') {
    return `
      <div class="form-color-input">
        <div 
          class="form-color-preview" 
          style="background-color: ${value}"
          onclick="this.nextElementSibling.click()"
        ></div>
        <input 
          type="color" 
          class="form-input" 
          name="${field.name}"
          id="${field.id || field.name}"
          value="${value}"
          ${field.required ? 'required' : ''}
          ${field.disabled ? 'disabled' : ''}
          onchange="this.previousElementSibling.style.backgroundColor = this.value"
        />
      </div>
    `;
  }

  renderTagsInput(field, value = []) {
    const tags = Array.isArray(value) ? value : [];
    
    return `
      <div class="form-tags-input" data-field="${field.name}">
        <div class="form-tags-container" onclick="this.querySelector('.form-tag-input').focus()">
          ${tags.map(tag => `
            <div class="form-tag">
              <span>${tag}</span>
              <span class="form-tag-remove" onclick="this.parentElement.remove()">×</span>
            </div>
          `).join('')}
          <input 
            type="text" 
            class="form-tag-input" 
            placeholder="${field.placeholder || 'Add tags...'}"
            onkeydown="formBuilder.handleTagInput(event)"
            oninput="formBuilder.handleTagSuggestions(event)"
          />
        </div>
        <div class="form-tags-suggestions" style="display: none;"></div>
      </div>
    `;
  }

  renderSlider(field, value = 0) {
    const min = field.min || 0;
    const max = field.max || 100;
    const currentValue = Math.max(min, Math.min(max, value));
    const percentage = ((currentValue - min) / (max - min)) * 100;
    
    return `
      <div class="form-slider" data-field="${field.name}" data-min="${min}" data-max="${max}">
        <div class="form-slider-track" onclick="formBuilder.handleSliderClick(event)">
          <div class="form-slider-fill" style="width: ${percentage}%"></div>
          <div class="form-slider-thumb" style="left: ${percentage}%" 
               onmousedown="formBuilder.handleSliderDrag(event)"></div>
        </div>
        <div class="form-slider-value">${currentValue}</div>
        <input type="hidden" name="${field.name}" value="${currentValue}" />
      </div>
    `;
  }

  renderHiddenInput(field, value = '') {
    return `
      <input 
        type="hidden" 
        name="${field.name}"
        value="${value}"
      />
    `;
  }

  // Event handlers for special components
  handleTagInput(event) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      const input = event.target;
      const value = input.value.trim();
      
      if (value) {
        const tag = document.createElement('div');
        tag.className = 'form-tag';
        tag.innerHTML = `
          <span>${value}</span>
          <span class="form-tag-remove" onclick="this.parentElement.remove()">×</span>
        `;
        
        input.parentElement.insertBefore(tag, input);
        input.value = '';
      }
    }
  }

  handleTagSuggestions(event) {
    // Implement tag suggestions if needed
  }

  handleSliderClick(event) {
    const slider = event.currentTarget.closest('.form-slider');
    const rect = event.currentTarget.getBoundingClientRect();
    const percentage = (event.clientX - rect.left) / rect.width;
    this.updateSlider(slider, percentage);
  }

  handleSliderDrag(event) {
    const slider = event.target.closest('.form-slider');
    const track = slider.querySelector('.form-slider-track');
    
    const handleMouseMove = (e) => {
      const rect = track.getBoundingClientRect();
      const percentage = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      this.updateSlider(slider, percentage);
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }

  updateSlider(slider, percentage) {
    const min = parseFloat(slider.dataset.min);
    const max = parseFloat(slider.dataset.max);
    const value = Math.round(min + (max - min) * percentage);
    
    slider.querySelector('.form-slider-fill').style.width = `${percentage * 100}%`;
    slider.querySelector('.form-slider-thumb').style.left = `${percentage * 100}%`;
    slider.querySelector('.form-slider-value').textContent = value;
    slider.querySelector('input[type="hidden"]').value = value;
  }

  // Validation
  validateField(field, value) {
    const errors = [];
    
    if (field.validators) {
      for (const validator of field.validators) {
        if (typeof validator === 'string') {
          const validatorFn = this.validators.get(validator);
          if (validatorFn) {
            const error = validatorFn(value);
            if (error) errors.push(error);
          }
        } else if (typeof validator === 'object') {
          const validatorFn = this.validators.get(validator.type);
          if (validatorFn) {
            const error = validatorFn(value, validator.value);
            if (error) errors.push(error);
          }
        } else if (typeof validator === 'function') {
          const error = validator(value);
          if (error) errors.push(error);
        }
      }
    }
    
    return errors;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

class DynamicForm {
  constructor(id, config, builder) {
    this.id = id;
    this.config = config;
    this.builder = builder;
    this.data = config.data || {};
    this.errors = {};
    this.isLoading = false;
    
    this.container = config.container;
    if (typeof this.container === 'string') {
      this.container = document.querySelector(this.container);
    }
  }

  render() {
    if (!this.container) {
      console.error('Form container not found');
      return;
    }

    let html = `<form class="form-builder ${this.isLoading ? 'form-loading' : ''}" id="${this.id}">`;

    // Render sections or fields
    if (this.config.sections) {
      this.config.sections.forEach(section => {
        html += this.renderSection(section);
      });
    } else if (this.config.fields) {
      html += this.renderFields(this.config.fields);
    }

    // Render actions
    html += this.renderActions();
    html += '</form>';

    this.container.innerHTML = html;
    this.attachEventListeners();
  }

  renderSection(section) {
    return `
      <div class="form-section">
        ${section.title ? `<h3 class="form-section-title">${section.title}</h3>` : ''}
        ${this.renderFields(section.fields)}
      </div>
    `;
  }

  renderFields(fields) {
    return fields.map(field => this.renderField(field)).join('');
  }

  renderField(field) {
    const renderer = this.builder.components.get(field.type || 'text');
    if (!renderer) {
      console.warn(`Unknown field type: ${field.type}`);
      return '';
    }

    const value = this.data[field.name] || field.defaultValue || '';
    const hasError = this.errors[field.name];
    const fieldHtml = renderer(field, value);

    if (field.type === 'hidden') {
      return fieldHtml;
    }

    const containerClass = `form-group ${field.containerClass || ''}`;
    const labelClass = `form-label ${field.required ? 'required' : ''}`;

    return `
      <div class="${containerClass}">
        ${field.label ? `<label for="${field.id || field.name}" class="${labelClass}">${field.label}</label>` : ''}
        ${fieldHtml}
        ${hasError ? `<div class="form-error">⚠️ ${this.errors[field.name].join(', ')}</div>` : ''}
        ${field.help ? `<div class="form-help">${field.help}</div>` : ''}
      </div>
    `;
  }

  renderActions() {
    const actions = this.config.actions || [
      { type: 'submit', label: 'Save', class: 'btn btn-primary' },
      { type: 'cancel', label: 'Cancel', class: 'btn btn-secondary' }
    ];

    return `
      <div class="form-actions">
        ${actions.map(action => `
          <button 
            type="${action.type}" 
            class="${action.class || 'btn'}"
            ${action.disabled ? 'disabled' : ''}
          >
            ${action.label}
          </button>
        `).join('')}
      </div>
    `;
  }

  attachEventListeners() {
    const form = document.getElementById(this.id);
    if (!form) return;

    form.addEventListener('submit', this.handleSubmit.bind(this));
    form.addEventListener('input', this.handleInput.bind(this));
    form.addEventListener('change', this.handleChange.bind(this));

    // Cancel button
    const cancelBtn = form.querySelector('button[type="cancel"]');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (this.config.onCancel) {
          this.config.onCancel();
        }
      });
    }
  }

  async handleSubmit(event) {
    event.preventDefault();
    
    if (this.isLoading) return;

    // Collect form data
    const formData = new FormData(event.target);
    const data = {};

    // Handle regular fields
    for (const [key, value] of formData.entries()) {
      if (key.endsWith('[]')) {
        const name = key.slice(0, -2);
        if (!data[name]) data[name] = [];
        data[name].push(value);
      } else if (key.includes('_date') || key.includes('_time')) {
        const baseName = key.replace('_date', '').replace('_time', '');
        if (!data[baseName]) data[baseName] = '';
        
        if (key.endsWith('_date')) {
          data[baseName] = value;
        } else if (key.endsWith('_time')) {
          data[baseName] = data[baseName] ? `${data[baseName]}T${value}` : value;
        }
      } else {
        data[key] = value;
      }
    }

    // Handle special fields (tags, etc.)
    this.collectSpecialFieldData(data);

    // Validate
    this.errors = {};
    const fields = this.getAllFields();
    
    for (const field of fields) {
      const errors = this.builder.validateField(field, data[field.name]);
      if (errors.length > 0) {
        this.errors[field.name] = errors;
      }
    }

    if (Object.keys(this.errors).length > 0) {
      this.render(); // Re-render to show errors
      return;
    }

    // Submit
    this.setLoading(true);
    
    try {
      if (this.config.onSubmit) {
        await this.config.onSubmit(data);
      }
    } catch (error) {
      if (this.config.onError) {
        this.config.onError(error);
      } else {
        console.error('Form submission error:', error);
      }
    } finally {
      this.setLoading(false);
    }
  }

  handleInput(event) {
    // Clear errors on input
    if (this.errors[event.target.name]) {
      delete this.errors[event.target.name];
      this.updateFieldError(event.target.name);
    }
  }

  handleChange(event) {
    // Update data
    this.data[event.target.name] = event.target.value;
    
    if (this.config.onChange) {
      this.config.onChange(event.target.name, event.target.value, this.data);
    }
  }

  collectSpecialFieldData(data) {
    // Collect tags
    document.querySelectorAll('.form-tags-input').forEach(container => {
      const fieldName = container.dataset.field;
      const tags = Array.from(container.querySelectorAll('.form-tag span:first-child'))
        .map(span => span.textContent);
      data[fieldName] = tags;
    });
  }

  getAllFields() {
    const fields = [];
    
    if (this.config.sections) {
      this.config.sections.forEach(section => {
        fields.push(...section.fields);
      });
    } else if (this.config.fields) {
      fields.push(...this.config.fields);
    }
    
    return fields;
  }

  updateFieldError(fieldName) {
    const errorEl = document.querySelector(`[name="${fieldName}"]`).closest('.form-group').querySelector('.form-error');
    if (errorEl) {
      errorEl.remove();
    }
    
    const inputEl = document.querySelector(`[name="${fieldName}"]`);
    if (inputEl) {
      inputEl.classList.remove('error');
    }
  }

  setLoading(loading) {
    this.isLoading = loading;
    const form = document.getElementById(this.id);
    if (form) {
      form.classList.toggle('form-loading', loading);
      
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = loading;
        submitBtn.textContent = loading ? 'Saving...' : (submitBtn.dataset.originalText || 'Save');
        if (!submitBtn.dataset.originalText) {
          submitBtn.dataset.originalText = submitBtn.textContent;
        }
      }
    }
  }

  setData(data) {
    this.data = { ...data };
    this.render();
  }

  getData() {
    return { ...this.data };
  }

  setErrors(errors) {
    this.errors = { ...errors };
    this.render();
  }

  clearErrors() {
    this.errors = {};
    this.render();
  }

  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
    }
    this.builder.forms.delete(this.id);
  }
}

// Global form builder instance
const formBuilder = new FormBuilder();

// Make it globally available
window.formBuilder = formBuilder;
window.DynamicForm = DynamicForm;

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { FormBuilder, DynamicForm };
}