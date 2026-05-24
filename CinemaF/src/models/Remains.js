export class Remains {
  constructor(productId, productName, bar, warehouse, lastModified) {
    this.productId = productId
    this.productName = productName
    this.bar = bar
    this.warehouse = warehouse
    this.lastModified = lastModified
  }
}

export class StockMovement {
  constructor(id, productName, type, quantity, source, target, adminId, createdAt, note) {
    this.id = id
    this.productName = productName
    this.type = type
    this.quantity = quantity
    this.source = source
    this.target = target
    this.adminId = adminId
    this.createdAt = createdAt
    this.note = note
  }
}