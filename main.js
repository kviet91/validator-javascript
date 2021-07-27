// function valid
function Validator(options) {
  function getParentElement(element, selector) {
    while (element.parentElement) {
      if (element.parentElement.matches(selector)) {
        return element.parentElement;
      }
      element = element.parentElement;
    }
  }

  let selectorRules = {};
  function validate(inputElement, rule) {
    let errorMessage,
      parentElement = getParentElement(inputElement, options.formGroup),
      errorElement = parentElement.querySelector(options.message),
      rules = selectorRules[rule.selector];
    for (let i = 0; i < rules.length; i++) {
      errorMessage = rules[i](inputElement.value);
      if (errorMessage) break;
    }
    if (errorMessage) {
      errorElement.innerText = errorMessage;
      parentElement.classList.add("invalid");
    } else {
      errorElement.innerText = "";
      parentElement.classList.remove("invalid");
    }
    return !errorMessage;
  }

  let formElement = document.querySelector(options.form);
  if (formElement) {
    formElement.onsubmit = function (e) {
      e.preventDefault();
      let isValidForm = true;
      options.rules.forEach(function (rule) {
        let inputElement = formElement.querySelector(rule.selector);
        let isValid = validate(inputElement, rule);
        if (!isValid) {
          isValidForm = false;
        }
      });
      console.log(isValidForm);
      if (isValidForm) {
        if (typeof options.onSubmit === "function") {
          let enableInput = formElement.querySelectorAll(
            "[name]:not([disabled])"
          );

          let formValues = Array.from(enableInput).reduce(function (
            values,
            input
          ) {
            values[input.name] = input.value;
            return values;
          },
          {});
          options.onSubmit(formValues);
        } else {
          formElement.submit();
        }
      }
    };
    options.rules.forEach(function (rule) {
      if (Array.isArray(selectorRules[rule.selector])) {
        selectorRules[rule.selector].push(rule.test);
      } else {
        selectorRules[rule.selector] = [rule.test];
      }
      let inputElement = formElement.querySelector(rule.selector);
      if (inputElement) {
        inputElement.onblur = function () {
          validate(this, rule);
        };
      }
    });
  }
}

// Definition Rules

Validator.isRequired = function (selector, message) {
  return {
    selector: selector,
    test: function (value) {
      return value.trim() ? undefined : message || "Vui long nhap truong nay";
    },
  };
};

Validator.isEmail = function (selector, message) {
  return {
    selector: selector,
    test: function (value) {
      let regex =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
      return regex.test(value) ? undefined : message || "vui long nhap email";
    },
  };
};

Validator.minLength = function (selector, min, message) {
  return {
    selector: selector,
    test: function (value) {
      return value.length >= min
        ? undefined
        : message || `vui long nhap lai gia tri ${min} mk`;
    },
  };
};

Validator.isConfirmed = function (selector, getConfirmValue, message) {
  return {
    selector: selector,
    test: function (value) {
      return value === getConfirmValue()
        ? undefined
        : message || "gia  tri nhap vao khong chinh xac";
    },
  };
};
