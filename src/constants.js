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
  price: 0,
  start_datetime: "",
  end_datetime: "",
  total_capacity: 30,
  max_tickets_per_purchase: 1,
  schedule_start_date: "",
  schedule_end_date: "",
  schedule_weekdays: [0, 1, 2, 3, 4],
  schedule_start_time: "09:00",
  schedule_end_time: "17:00",
  slot_minutes: 30,
  status: "available",
};
