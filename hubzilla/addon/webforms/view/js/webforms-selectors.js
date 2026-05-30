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

  function optionsMap(elementId, datasetName) {
    const node = document.getElementById(elementId);

    if (!node || !node.dataset[datasetName]) {
      return {};
    }

    try {
      return JSON.parse(node.dataset[datasetName]);
    }
    catch (error) {
      console.warn('Webforms options could not be parsed.', error);
      return {};
    }
  }

  function populateForms(select, options, selectedValue) {
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

  function loadDesignSelection(servicePackSelect, formSelect) {
    const servicePack = servicePackSelect ? (servicePackSelect.value || '') : '';
    const option = selectedOption(formSelect);
    const formId = formSelect ? (formSelect.value || '') : '';
    const packageUrl = option ? (option.dataset.webformsPackageUrl || '') : '';
    const runtime = document.getElementById('webforms-runtime');
    const designTab = runtime && runtime.dataset.webformsDesignTab ? runtime.dataset.webformsDesignTab : 'grid';

    if (runtime) {
      runtime.dataset.webformsServicePack = servicePack;
      runtime.dataset.webformsDesignForm = formId;
      runtime.dataset.webformsPackageUrl = packageUrl;
    }

    updateUrl({
      mode: 'design',
      service_pack: servicePack,
      design_form: formId,
      design_tab: designTab,
      deploy_form: null,
      collection: null
    });

    document.dispatchEvent(new CustomEvent('webforms:design-package-selected', {
      detail: {
        servicePack: servicePack,
        formId: formId,
        packageUrl: packageUrl
      }
    }));
  }

  function initDesignSelector() {
    const servicePackSelect = document.getElementById('webforms-design-service-pack-select');
    const formSelect = document.getElementById('webforms-design-form-select');

    if (!servicePackSelect || !formSelect) {
      return;
    }

    const optionsByServicePack = optionsMap('webforms-design-selector', 'webformsDesignOptions');

    servicePackSelect.addEventListener('change', function () {
      const servicePack = servicePackSelect.value || '';

      populateForms(formSelect, optionsByServicePack[servicePack] || optionsByServicePack[''] || [], '');
      loadDesignSelection(servicePackSelect, formSelect);
    });

    formSelect.addEventListener('change', function () {
      loadDesignSelection(servicePackSelect, formSelect);
    });
  }

  function loadDeploySelection(servicePackSelect, formSelect) {
    const servicePack = servicePackSelect ? (servicePackSelect.value || '') : '';
    const option = selectedOption(formSelect);
    const formId = formSelect ? (formSelect.value || '') : '';
    const packageUrl = option ? (option.dataset.webformsPackageUrl || '') : '';
    const runtime = document.getElementById('webforms-runtime');

    if (runtime) {
      runtime.dataset.webformsServicePack = servicePack;
      runtime.dataset.webformsDeployForm = formId;
      runtime.dataset.webformsPackageUrl = packageUrl;
    }

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

    const optionsByServicePack = optionsMap('webforms-deploy-navigation', 'webformsDeployOptions');

    servicePackSelect.addEventListener('change', function () {
      const servicePack = servicePackSelect.value || '';

      populateForms(formSelect, optionsByServicePack[servicePack] || optionsByServicePack[''] || [], '');
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
