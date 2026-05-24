export class Receipt {
  constructor(id, administratorId, date, totalAmount, paymentMethod, typeOfOperation, merchandiseItems, comboItems) {
    this.id = id
    this.administratorId = administratorId
    this.date = date
    this.totalAmount = totalAmount
    this.paymentMethod = paymentMethod
    this.typeOfOperation = typeOfOperation
    this.merchandiseItems = merchandiseItems || []
    this.comboItems = comboItems || []
  }
}