// Central registry of all vendor-app images. Each entry maps a logical key
// (matching the Flutter `lib/util/images.dart` constants) to a `require()`'d
// asset under `/assets/images`. Using `require` lets Metro bundle the asset
// and produce a numeric ID that `Image`/`expo-image` understand on every
// platform (web, ios, android).
//
// NOTE: every entry below uses a static `require()` call — Metro cannot
// resolve dynamic `require()` calls built from template strings, so do
// not reintroduce a `png(name)`-style helper here.

export const Images = {
  // Brand
  logo: require('../../assets/images/logo.png'),
  appIcon: require('../../assets/images/app_icon.png'),
  profileBg: require('../../assets/images/profile_bg.png'),
  restaurant: require('../../assets/images/restaurant.png'),
  restaurantCover: require('../../assets/images/restaurant_cover.png'),
  storeRegistrationSuccess: require('../../assets/images/store_registration_success.svg'),
  pickStoreMarker: require('../../assets/images/pick_store_marker.svg'),
  shopIcon: require('../../assets/images/shop_icon.svg'),

  // Nav icons (selected / unselected pairs)
  homeSelect: require('../../assets/images/home_select.png'),
  homeUnselect: require('../../assets/images/home_unselect.png'),
  orderSelect: require('../../assets/images/order_select.png'),
  orderUnselect: require('../../assets/images/order_unselect.png'),
  walletSelect: require('../../assets/images/wallet_select.png'),
  walletUnselect: require('../../assets/images/wallet_unselect.png'),

  // Tab icons (general)
  home: require('../../assets/images/home_select.png'),
  order: require('../../assets/images/order.png'),
  wallet: require('../../assets/images/wallet.png'),
  menu: require('../../assets/images/menu.png'),
  user: require('../../assets/images/user.png'),
  settings: require('../../assets/images/settings.png'),
  notification: require('../../assets/images/notification_in.png'),
  announcement: require('../../assets/images/announcement_icon.png'),

  // Auth & account
  mail: require('../../assets/images/mail.png'),
  lock: require('../../assets/images/lock.png'),
  passChange: require('../../assets/images/pass_change.png'),
  logOut: require('../../assets/images/log_out.png'),
  alert: require('../../assets/images/alert.png'),
  warning: require('../../assets/images/warning.png'),
  check: require('../../assets/images/check.gif'),
  cancel: require('../../assets/images/cancel.gif'),
  deliveredSuccess: require('../../assets/images/delivered_success.gif'),
  checked: require('../../assets/images/checked.png'),

  // Money & payments
  money: require('../../assets/images/money.png'),
  cash: require('../../assets/images/cash.png'),
  creditCard: require('../../assets/images/credit_card.png'),
  bank: require('../../assets/images/bank.png'),
  bankInfo: require('../../assets/images/bank_info.png'),
  dollar: require('../../assets/images/dollar.png'),
  expense: require('../../assets/images/expense.png'),
  transaction: require('../../assets/images/transaction.png'),
  transactionReport: require('../../assets/images/transaction_report.png'),
  transactionReportIcon: require('../../assets/images/transaction_report_icon.png'),
  disbursement: require('../../assets/images/disbursement.png'),
  totalBillIcon: require('../../assets/images/total_bill_icon.png'),
  vatTaxIcon: require('../../assets/images/vat_tax_icon.svg'),
  taxReportIcon: require('../../assets/images/tax_report_icon.png'),
  taxOrderIcon: require('../../assets/images/tax_order_icon.png'),
  taxAmountIcon: require('../../assets/images/tax_amount_icon.png'),
  onHoldTransactionIcon: require('../../assets/images/on_hold_transaction_icon.png'),
  completeTransactionIcon: require('../../assets/images/complete_transaction_icon.png'),
  cancelTransactionIcon: require('../../assets/images/cancel_transaction_icon.png'),

  // Wallet / disbursement dialog icons
  pauseDialog: require('../../assets/images/pause_dialog_icon.png'),
  resumeDialog: require('../../assets/images/resume_dialog_icon.png'),
  deleteDialog: require('../../assets/images/delete_dialog_icon.png'),
  cautionDialog: require('../../assets/images/caution_dialog_icon.png'),
  attentionWarning: require('../../assets/images/attention_warning_icon.png'),

  // Misc UI
  edit: require('../../assets/images/edit.png'),
  update: require('../../assets/images/update.png'),
  change: require('../../assets/images/change_icon.png'),
  uploadIcon: require('../../assets/images/taxi_image/upload_icon.png'),
  pendingItem: require('../../assets/images/pending_item_icon.png'),
  note: require('../../assets/images/note_icon.png'),
  nextBillingDate: require('../../assets/images/next_billing_date_icon.png'),
  numberOfUses: require('../../assets/images/number_of_uses_icon.png'),
  mySubscription: require('../../assets/images/my_subscription_icon.png'),
  trial: require('../../assets/images/trial.png'),

  // Catalog
  addFood: require('../../assets/images/add_food.png'),
  addon: require('../../assets/images/addon.png'),
  categories: require('../../assets/images/categories.png'),
  preview: require('../../assets/images/preview.svg'),

  // Coupon
  coupon: require('../../assets/images/coupon.png'),
  couponDetails: require('../../assets/images/coupon_details.png'),
  couponBgDark1: require('../../assets/images/coupon_bg_dark1.png'),
  cupon: require('../../assets/images/cupon.png'),

  // Campaigns / ads
  campaign: require('../../assets/images/campaign.png'),
  adsMenu: require('../../assets/images/ads_menu.png'),
  adsImage: require('../../assets/images/adsImage.svg'),
  adsList: require('../../assets/images/ads_list.svg'),
  adsType: require('../../assets/images/ads_type.svg'),
  adsSuccess: require('../../assets/images/ads_success.svg'),
  adsRoundShape: require('../../assets/images/ads_round_shape.svg'),
  adsCurveShape: require('../../assets/images/ads_curve_shape.svg'),

  // Chat
  chat: require('../../assets/images/chat.png'),
  chatIcon: require('../../assets/images/chat_icon.png'),
  call: require('../../assets/images/call.png'),
  callIcon: require('../../assets/images/call_icon.png'),
  send: require('../../assets/images/send.png'),

  // Delivery / store
  deliveryMan: require('../../assets/images/delivery_man.png'),
  branch: require('../../assets/images/branch.png'),
  pos: require('../../assets/images/pos.png'),
  qrIcon: require('../../assets/images/qr_icon.png'),
  placeholder: require('../../assets/images/placeholder.jpg'),
  notificationPlaceholder: require('../../assets/images/notification_placeholder.jpg'),
  pickMarker: require('../../assets/images/pick_marker.png'),
  shape: require('../../assets/images/shape.png'),
  bannerIcon: require('../../assets/images/banner_icon.png'),
  fire: require('../../assets/images/fire.png'),
  image: require('../../assets/images/image.png'),
  emptyBox: require('../../assets/images/empty_box.png'),
  maintenance: require('../../assets/images/maintenance.png'),
  support: require('../../assets/images/support.png'),
  terms: require('../../assets/images/terms.png'),
  policy: require('../../assets/images/policy.png'),
  review: require('../../assets/images/review.png'),
  useAi: require('../../assets/images/use_ai.png'),
  aiAssistance: require('../../assets/images/ai_assistance.png'),
  paymentStatus: require('../../assets/images/payment_status.svg'),
  language: require('../../assets/images/language.png'),
  languageBg: require('../../assets/images/language_bg.svg'),
  calender: require('../../assets/images/calender.svg'),

  // Language flag icons
  flagEnglish: require('../../assets/images/english.png'),
  flagSpanish: require('../../assets/images/spanish.png'),
  flagFrench: require('../../assets/images/french.png'),
  flagArabic: require('../../assets/images/arabic.png'),
  flagBangla: require('../../assets/images/bangla.png'),

  // Taxi / rental module
  taxiHome: require('../../assets/images/taxi_home.png'),
  taxiPickup: require('../../assets/images/taxi_image/taxi_pickup.png'),
  taxiDestination: require('../../assets/images/taxi_image/taxi_destination.png'),
  taxiAcIcon: require('../../assets/images/taxi_image/ac_icon.png'),
  taxiAddCar: require('../../assets/images/taxi_image/add_car_icon.png'),
  taxiAnnouncement: require('../../assets/images/taxi_image/announcement_icon.png'),
  taxiAutomatic: require('../../assets/images/taxi_image/automatic_icon.png'),
  taxiBrake: require('../../assets/images/taxi_image/brake_icon.png'),
  taxiBrand: require('../../assets/images/taxi_image/brand_icon.png'),
  taxiCarSide: require('../../assets/images/taxi_image/car_side_icon.png'),
  taxiCharge: require('../../assets/images/taxi_image/charge_icon.png'),
  taxiConfirmPayment: require('../../assets/images/taxi_image/confirm_payment_icon.png'),
  taxiDelete: require('../../assets/images/taxi_image/delete_icon.png'),
  taxiDistance: require('../../assets/images/taxi_image/distance_icon.png'),
  taxiDriverDelete: require('../../assets/images/taxi_image/driver_delete_conformation_icon.png'),
  taxiDriver: require('../../assets/images/taxi_image/driver_icon.png'),
  taxiEdit: require('../../assets/images/taxi_image/edit_icon.png'),
  taxiEditOutlined: require('../../assets/images/taxi_image/edit_icon_outlined.png'),
  taxiFilter: require('../../assets/images/taxi_image/filter_icon.png'),
  taxiFuelExpense: require('../../assets/images/taxi_image/fuel_expense_icon.png'),
  taxiFuel: require('../../assets/images/taxi_image/fuel_icon.png'),
  taxiHourly: require('../../assets/images/taxi_image/hourly_icon.png'),
  taxiNavigationArrow: require('../../assets/images/taxi_image/navigation_arrow.png'),
  taxiPerDay: require('../../assets/images/taxi_image/per_day_icon.png'),
  taxiRating: require('../../assets/images/taxi_image/rating_icon.png'),
  taxiSetCapacity: require('../../assets/images/taxi_image/set_capacity_icon.png'),
  taxiUploadIcon: require('../../assets/images/taxi_image/upload_icon.png'),

  // Default placeholder (used as fallback)
  placeholderLogo: require('../../assets/images/logo.png'),
} as const;

export type ImageKey = keyof typeof Images;