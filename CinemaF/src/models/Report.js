export class TopProductDto {
  constructor(productId, productName, totalQuantity, totalRevenue) {
    this.productId = productId
    this.productName = productName
    this.totalQuantity = totalQuantity
    this.totalRevenue = totalRevenue
  }
}

export class TopMerchandiseDto {
  constructor(merchandiseId, merchandiseName, totalQuantity, totalRevenue) {
    this.merchandiseId = merchandiseId
    this.merchandiseName = merchandiseName
    this.totalQuantity = totalQuantity
    this.totalRevenue = totalRevenue
  }
}

export class SalesReportDto {
  constructor(receiptId, date, paymentMethod, totalAmount) {
    this.receiptId = receiptId
    this.date = date
    this.paymentMethod = paymentMethod
    this.totalAmount = totalAmount
  }
}