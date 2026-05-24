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

export class MerchandiseItem {
  constructor(merchandiseId, merchandiseName, price, quantity, subtotal) {
    this.merchandiseId = merchandiseId
    this.merchandiseName = merchandiseName
    this.price = price
    this.quantity = quantity
    this.subtotal = subtotal
  }
}

export class ComboItem {
  constructor(comboId, comboName, price, quantity, subtotal) {
    this.comboId = comboId
    this.comboName = comboName
    this.price = price
    this.quantity = quantity
    this.subtotal = subtotal
  }
}