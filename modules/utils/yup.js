async function yupValidate(schema, data) {
  return await schema
    .validate(data, { abortEarly: false })
    .then((valid) => {
      let data = {
        isValid: true,
        data: valid,
      };

      return data;
    })
    .catch((err) => {
      let data = {
        isValid: false,
        data: err.value,
        errors: err.errors,
      };

      console.log(data);
      return data;
    });
}

module.exports = yupValidate;
