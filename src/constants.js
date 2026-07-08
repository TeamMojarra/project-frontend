export const EMPTY_LOGIN = { email: "", password: "" };

export const EMPTY_REGISTER = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export const EMPTY_PAYMENT = {
  holder_name: "",
  card_number: "",
  expiry_date: "",
  cvc: "",
  result: "approved",
};

export const EMPTY_EVENT = {
  name: "",
  description: "",
  image_url: "",
  event_type: "event",
  modality: "presencial",
  location: "",
  start_datetime: "",
  end_datetime: "",
  total_capacity: 30,
  max_tickets_per_purchase: 1,
  status: "available",
};
