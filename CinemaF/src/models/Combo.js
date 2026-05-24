export class Combo {
  constructor(id, name, regularPrice, comboPrice, discountPercent, description, isActive, products) {
    this.id = id
    this.name = name
    this.regularPrice = regularPrice
    this.comboPrice = comboPrice
    this.discountPercent = discountPercent
    this.description = description
    this.isActive = isActive
    this.products = products || []
  }
}

export class ComboProduct {
  constructor(productId, productName, price, quantity) {
    this.productId = productId
    this.productName = productName
    this.price = price
    this.quantity = quantity
  }
}