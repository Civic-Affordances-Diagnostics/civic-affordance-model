(function () {
  'use strict';

  function selectedOption(select) {
    return select && select.options ? select.options[select.selectedIndex] : null;
  }

  function updateUrl(params) {
    if (!window.history || !window.history.replaceState) {
      return;
    }

    const url = new URL(window.location.href);

    Object.keys(params).forEach(function (key) {
      const value = params[key];

      if (value === null || value === undefined || value === '') {
        url.searchParams.delete(key);
      }
      else {
        url.searchParams.set(key, value);
      }
    });

    window.history.replaceState({}, '', url.toString());
  }

  function initDesignSelector() {
    const select = document.getElementById('webforms-design-form-select');

    if (!select) {
      return;
    }

    const wrapper = document.getElementById('webforms-design-selector');

    if (wrapper && wrapper.tagName === 'FORM') {
      wrapper.addEventListener('submit', function (event) {
        event.preventDefault();
      });
    }

    select.addEventListener('change', function () {
      const option = selectedOption(select);
      const formId = select.value || '';
      const packageUrl = option ? (option.dataset.webformsPackageUrl || '') : '';
      const runtime = document.getElementById('webforms-runtime');
      const designTab = runtime && runtime.dataset.webformsDesignTab ? runtime.dataset.webformsDesignTab : 'grid';

      updateUrl({
        mode: 'design',
        design_form: formId,
        design_tab: designTab,
        service_pack: null,
        deploy_form: null,
        collection: null
      });

      document.dispatchEvent(new CustomEvent('webforms:design-package-selected', {
        detail: {
          formId: formId,
          packageUrl: packageUrl
        }
      }));
    });
  }

  function deployOptionsMap() {
    const nav = document.getElementById('webforms-deploy-navigation');

    if (!nav || !nav.dataset.webformsDeployOptions) {
      return {};
    }

    try {
      return JSON.parse(nav.dataset.webformsDeployOptions);
    }
    catch (error) {
      console.warn('Webforms deploy options could not be parsed.', error);
      return {};
    }
  }

  function populateDeployForms(select, options, selectedValue) {
    select.innerHTML = '';

    (options || []).forEach(function (item) {
      const option = document.createElement('option');

      option.value = item.value || '';
      option.textContent = item.label || item.value || 'Webform';
      option.dataset.webformsPackageUrl = item.package_url || '';

      if ((selectedValue || '') === option.value) {
        option.selected = true;
      }

      select.appendChild(option);
    });
  }

  function loadDeploySelection(servicePackSelect, formSelect) {
    const servicePack = servicePackSelect ? (servicePackSelect.value || '') : '';
    const option = selectedOption(formSelect);
    const formId = formSelect ? (formSelect.value || '') : '';
    const packageUrl = option ? (option.dataset.webformsPackageUrl || '') : '';

    updateUrl({
      mode: 'deploy',
      service_pack: servicePack,
      deploy_form: formId,
      collection: null,
      design_form: null,
      design_tab: null
    });

    if (window.WebformsDeploy && typeof window.WebformsDeploy.loadAndRender === 'function') {
      window.WebformsDeploy.loadAndRender(packageUrl, formId, servicePack);
    }
  }

  function initDeploySelector() {
    const servicePackSelect = document.getElementById('webforms-deploy-service-pack-select');
    const formSelect = document.getElementById('webforms-deploy-form-select');

    if (!servicePackSelect || !formSelect) {
      return;
    }

    const wrapper = document.getElementById('webforms-deploy-selector');

    if (wrapper && wrapper.tagName === 'FORM') {
      wrapper.addEventListener('submit', function (event) {
        event.preventDefault();
      });
    }

    const optionsByServicePack = deployOptionsMap();

    servicePackSelect.addEventListener('change', function () {
      const servicePack = servicePackSelect.value || '';

      populateDeployForms(formSelect, optionsByServicePack[servicePack] || optionsByServicePack[''] || [], '');
      loadDeploySelection(servicePackSelect, formSelect);
    });

    formSelect.addEventListener('change', function () {
      loadDeploySelection(servicePackSelect, formSelect);
    });
  }

  function init() {
    initDesignSelector();
    initDeploySelector();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  }
  else {
    init();
  }
}());
