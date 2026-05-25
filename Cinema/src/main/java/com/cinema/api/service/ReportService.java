package com.cinema.api.service;

import com.cinema.api.dto.*;
import com.cinema.api.entity.*;
import com.cinema.api.repository.*;
import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.BaseFont;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final ReceiptRepository receiptRepository;
    private final ReceiptMerchandiseRepository receiptMerchandiseRepository;
    private final ReceiptComboRepository receiptComboRepository;
    private final ComboProductRepository comboProductRepository;
    private final ProductRepository productRepository;
    private final MerchandiseRepository merchandiseRepository;

    public ReportService(ReceiptRepository receiptRepository,
                         ReceiptMerchandiseRepository receiptMerchandiseRepository,
                         ReceiptComboRepository receiptComboRepository,
                         ComboProductRepository comboProductRepository,
                         ProductRepository productRepository,
                         MerchandiseRepository merchandiseRepository) {
        this.receiptRepository = receiptRepository;
        this.receiptMerchandiseRepository = receiptMerchandiseRepository;
        this.receiptComboRepository = receiptComboRepository;
        this.comboProductRepository = comboProductRepository;
        this.productRepository = productRepository;
        this.merchandiseRepository = merchandiseRepository;
    }

    @Transactional(readOnly = true)
    public List<TopProductDto> getTopProducts(int limit) {
        List<Product> products = productRepository.findAll();
        Map<Long, TopProductDto> stats = new HashMap<>();

        for (Product product : products) {
            Integer soldQuantity = comboProductRepository.sumQuantityByProductId(product.getId());
            if (soldQuantity == null) soldQuantity = 0;
            double revenue = soldQuantity * product.getPrice();
            stats.put(product.getId(), new TopProductDto(product.getId(), product.getName(), soldQuantity, revenue));
        }

        return stats.values().stream()
                .sorted((a, b) -> b.getTotalQuantity().compareTo(a.getTotalQuantity()))
                .limit(limit)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TopMerchandiseDto> getTopMerchandise(int limit) {
        List<Merchandise> merchandiseList = merchandiseRepository.findAll();
        Map<Long, TopMerchandiseDto> stats = new HashMap<>();

        for (Merchandise merch : merchandiseList) {
            Integer soldQuantity = receiptMerchandiseRepository.sumQuantityByMerchandiseId(merch.getId());
            if (soldQuantity == null) soldQuantity = 0;
            Double revenue = receiptMerchandiseRepository.sumRevenueByMerchandiseId(merch.getId());
            if (revenue == null) revenue = 0.0;
            stats.put(merch.getId(), new TopMerchandiseDto(merch.getId(), merch.getName(), soldQuantity, revenue));
        }

        return stats.values().stream()
                .sorted((a, b) -> b.getTotalQuantity().compareTo(a.getTotalQuantity()))
                .limit(limit)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SalesReportDto> getSalesReportData(LocalDateTime start, LocalDateTime end) {
        List<Receipt> receipts = receiptRepository.findByDateRange(start, end);

        Map<Long, Double> netAmountByReceipt = new HashMap<>();

        for (Receipt receipt : receipts) {
            if ("SALE".equals(receipt.getTypeOfOperation())) {
                netAmountByReceipt.put(receipt.getId(), receipt.getTotalAmount());
            } else if ("RETURN".equals(receipt.getTypeOfOperation()) && receipt.getOriginalReceiptId() != null) {
                netAmountByReceipt.merge(receipt.getOriginalReceiptId(), -receipt.getTotalAmount(), Double::sum);
            }
        }

        return netAmountByReceipt.entrySet().stream()
                .filter(e -> Math.abs(e.getValue()) > 0.01)
                .map(e -> {
                    Receipt receipt = receiptRepository.findById(e.getKey()).orElse(null);
                    if (receipt == null) return null;
                    return new SalesReportDto(receipt.getId(), receipt.getDate(),
                            receipt.getPaymentMethod(), e.getValue());
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    private Font getCyrillicFont(String fontName, float size, int style) {
        try {
            return FontFactory.getFont(fontName, BaseFont.IDENTITY_H, BaseFont.EMBEDDED, size, style);
        } catch (Exception e) {
            return FontFactory.getFont(FontFactory.HELVETICA, size, style);
        }
    }
    public byte[] exportSalesReportToExcel(LocalDateTime start, LocalDateTime end) throws IOException {
        List<SalesReportDto> data = getSalesReportData(start, end);

        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Отчёт по продажам");

        CellStyle titleStyle = createTitleStyle(workbook);
        CellStyle headerStyle = createHeaderStyle(workbook);
        CellStyle dataStyle = createDataStyle(workbook);
        CellStyle currencyStyle = createCurrencyStyle(workbook);

        Row titleRow = sheet.createRow(0);
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue("ОТЧЁТ ПО ПРОДАЖАМ");
        titleCell.setCellStyle(titleStyle);

        sheet.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(0, 0, 0, 3));

        Row periodRow = sheet.createRow(1);
        Cell periodCell = periodRow.createCell(0);
        periodCell.setCellValue("Период: " +
                start.format(DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm")) + " – " +
                end.format(DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm")));
        periodCell.setCellStyle(dataStyle);
        sheet.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(1, 1, 0, 3));

        sheet.createRow(2);

        Row header = sheet.createRow(3);
        String[] columns = {"ID чека", "Дата", "Способ оплаты", "Сумма, ₽"};
        for (int i = 0; i < columns.length; i++) {
            Cell cell = header.createCell(i);
            cell.setCellValue(columns[i]);
            cell.setCellStyle(headerStyle);
        }

        int rowNum = 4;
        for (SalesReportDto dto : data) {
            Row row = sheet.createRow(rowNum++);

            Cell idCell = row.createCell(0);
            idCell.setCellValue(dto.getReceiptId());
            idCell.setCellStyle(dataStyle);

            Cell dateCell = row.createCell(1);
            dateCell.setCellValue(dto.getDate().format(DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm")));
            dateCell.setCellStyle(dataStyle);

            Cell paymentCell = row.createCell(2);
            paymentCell.setCellValue(translatePaymentMethod(dto.getPaymentMethod()));
            paymentCell.setCellStyle(dataStyle);

            Cell amountCell = row.createCell(3);
            amountCell.setCellValue(dto.getTotalAmount());
            amountCell.setCellStyle(currencyStyle);
        }

        Row totalRow = sheet.createRow(rowNum);
        Cell totalLabelCell = totalRow.createCell(2);
        totalLabelCell.setCellValue("Общая выручка:");
        totalLabelCell.setCellStyle(headerStyle);

        double totalAmount = data.stream().mapToDouble(SalesReportDto::getTotalAmount).sum();
        Cell totalAmountCell = totalRow.createCell(3);
        totalAmountCell.setCellValue(totalAmount);
        totalAmountCell.setCellStyle(currencyStyle);

        Row footerRow = sheet.createRow(rowNum + 1);
        Cell footerCell = footerRow.createCell(0);
        footerCell.setCellValue("Отчёт сгенерирован: " +
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm:ss")));
        footerCell.setCellStyle(dataStyle);

        for (int i = 0; i < columns.length; i++) {
            sheet.autoSizeColumn(i);
            sheet.setColumnWidth(i, Math.min(sheet.getColumnWidth(i) + 512, 15000));
        }

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        workbook.write(out);
        workbook.close();
        return out.toByteArray();
    }

    public byte[] exportTopProductsToExcel(int limit) throws IOException {
        List<TopProductDto> data = getTopProducts(limit);

        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Топ товаров бара");

        CellStyle titleStyle = createTitleStyle(workbook);
        CellStyle headerStyle = createHeaderStyle(workbook);
        CellStyle dataStyle = createDataStyle(workbook);
        CellStyle currencyStyle = createCurrencyStyle(workbook);

        Row titleRow = sheet.createRow(0);
        titleRow.createCell(0).setCellValue("ТОП " + limit + " ТОВАРОВ БАРА");
        titleRow.getCell(0).setCellStyle(titleStyle);
        sheet.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(0, 0, 0, 4));

        sheet.createRow(1);

        Row header = sheet.createRow(2);
        String[] columns = {"№", "ID", "Название", "Продано, шт", "Выручка, ₽"};
        for (int i = 0; i < columns.length; i++) {
            Cell cell = header.createCell(i);
            cell.setCellValue(columns[i]);
            cell.setCellStyle(headerStyle);
        }

        int rowNum = 3;
        for (int i = 0; i < data.size(); i++) {
            TopProductDto dto = data.get(i);
            Row row = sheet.createRow(rowNum++);

            row.createCell(0).setCellValue(i + 1);
            row.createCell(1).setCellValue(dto.getProductId());
            row.createCell(2).setCellValue(dto.getProductName());
            row.createCell(3).setCellValue(dto.getTotalQuantity());

            Cell revenueCell = row.createCell(4);
            revenueCell.setCellValue(dto.getTotalRevenue());
            revenueCell.setCellStyle(currencyStyle);

            for (int c = 0; c < 5; c++) {
                row.getCell(c).setCellStyle(i % 2 == 0 ? dataStyle : workbook.createCellStyle());
                if (i % 2 != 0) {
                    CellStyle altStyle = workbook.createCellStyle();
                    altStyle.cloneStyleFrom(dataStyle);
                    altStyle.setFillForegroundColor(IndexedColors.WHITE.getIndex());
                    altStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
                    row.getCell(c).setCellStyle(altStyle);
                }
            }
        }

        Row totalRow = sheet.createRow(rowNum);
        totalRow.createCell(3).setCellValue("Общая выручка:");
        totalRow.getCell(3).setCellStyle(headerStyle);
        double total = data.stream().mapToDouble(TopProductDto::getTotalRevenue).sum();
        Cell totalCell = totalRow.createCell(4);
        totalCell.setCellValue(total);
        totalCell.setCellStyle(currencyStyle);

        Row footerRow = sheet.createRow(rowNum + 1);
        footerRow.createCell(0).setCellValue("Отчёт сгенерирован: " +
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm:ss")));
        footerRow.getCell(0).setCellStyle(dataStyle);

        for (int i = 0; i < columns.length; i++) {
            sheet.autoSizeColumn(i);
            sheet.setColumnWidth(i, Math.min(sheet.getColumnWidth(i) + 512, 15000));
        }

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        workbook.write(out);
        workbook.close();
        return out.toByteArray();
    }

    public byte[] exportTopMerchandiseToExcel(int limit) throws IOException {
        List<TopMerchandiseDto> data = getTopMerchandise(limit);

        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Топ товаров мерча");

        CellStyle titleStyle = createTitleStyle(workbook);
        CellStyle headerStyle = createHeaderStyle(workbook);
        CellStyle dataStyle = createDataStyle(workbook);
        CellStyle currencyStyle = createCurrencyStyle(workbook);

        Row titleRow = sheet.createRow(0);
        titleRow.createCell(0).setCellValue("ТОП " + limit + " ТОВАРОВ МЕРЧА");
        titleRow.getCell(0).setCellStyle(titleStyle);
        sheet.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(0, 0, 0, 4));

        sheet.createRow(1);

        Row header = sheet.createRow(2);
        String[] columns = {"№", "ID", "Название", "Продано, шт", "Выручка, ₽"};
        for (int i = 0; i < columns.length; i++) {
            Cell cell = header.createCell(i);
            cell.setCellValue(columns[i]);
            cell.setCellStyle(headerStyle);
        }

        int rowNum = 3;
        for (int i = 0; i < data.size(); i++) {
            TopMerchandiseDto dto = data.get(i);
            Row row = sheet.createRow(rowNum++);

            row.createCell(0).setCellValue(i + 1);
            row.createCell(1).setCellValue(dto.getMerchandiseId());
            row.createCell(2).setCellValue(dto.getMerchandiseName());
            row.createCell(3).setCellValue(dto.getTotalQuantity());

            Cell revenueCell = row.createCell(4);
            revenueCell.setCellValue(dto.getTotalRevenue());
            revenueCell.setCellStyle(currencyStyle);

            for (int c = 0; c < 5; c++) {
                row.getCell(c).setCellStyle(dataStyle);
            }
        }

        Row totalRow = sheet.createRow(rowNum);
        totalRow.createCell(3).setCellValue("Общая выручка:");
        totalRow.getCell(3).setCellStyle(headerStyle);
        double total = data.stream().mapToDouble(TopMerchandiseDto::getTotalRevenue).sum();
        Cell totalCell = totalRow.createCell(4);
        totalCell.setCellValue(total);
        totalCell.setCellStyle(currencyStyle);

        Row footerRow = sheet.createRow(rowNum + 1);
        footerRow.createCell(0).setCellValue("Отчёт сгенерирован: " +
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm:ss")));
        footerRow.getCell(0).setCellStyle(dataStyle);

        for (int i = 0; i < columns.length; i++) {
            sheet.autoSizeColumn(i);
            sheet.setColumnWidth(i, Math.min(sheet.getColumnWidth(i) + 512, 15000));
        }

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        workbook.write(out);
        workbook.close();
        return out.toByteArray();
    }

    private String translatePaymentMethod(String method) {
        if (method == null) return "-";
        switch (method) {
            case "CASH": return "Наличные";
            case "CARD": return "Банковская карта";
            case "ONLINE": return "Онлайн-оплата";
            default: return method;
        }
    }

    public byte[] exportSalesReportToPdf(LocalDateTime start, LocalDateTime end) throws DocumentException {
        List<SalesReportDto> data = getSalesReportData(start, end);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4);
        PdfWriter.getInstance(document, out);
        document.open();

        Font titleFont = getCyrillicFont("Arial", 18, Font.BOLD);
        Font normalFont = getCyrillicFont("Arial", 10, Font.NORMAL);
        Font boldFont = getCyrillicFont("Arial", 10, Font.BOLD);

        Paragraph title = new Paragraph("ОТЧЁТ ПО ПРОДАЖАМ", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);

        document.add(new Paragraph(" "));

        Paragraph period = new Paragraph(
                "Период: " + start.format(DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm")) +
                        " – " + end.format(DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm")),
                normalFont
        );
        document.add(period);
        document.add(new Paragraph(" "));

        PdfPTable table = new PdfPTable(4);
        table.setWidthPercentage(100);

        table.addCell(new PdfPCell(new Phrase("ID чека", boldFont)));
        table.addCell(new PdfPCell(new Phrase("Дата", boldFont)));
        table.addCell(new PdfPCell(new Phrase("Способ оплаты", boldFont)));
        table.addCell(new PdfPCell(new Phrase("Сумма, ₽", boldFont)));

        for (SalesReportDto dto : data) {
            table.addCell(new PdfPCell(new Phrase(String.valueOf(dto.getReceiptId()), normalFont)));
            table.addCell(new PdfPCell(new Phrase(
                    dto.getDate().format(DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm")), normalFont)));
            table.addCell(new PdfPCell(new Phrase(
                    translatePaymentMethod(dto.getPaymentMethod()), normalFont)));
            table.addCell(new PdfPCell(new Phrase(
                    String.format("%.2f", dto.getTotalAmount()), normalFont)));
        }

        double total = data.stream().mapToDouble(SalesReportDto::getTotalAmount).sum();
        PdfPCell totalLabel = new PdfPCell(new Phrase("Общая выручка:", boldFont));
        totalLabel.setColspan(3);
        totalLabel.setHorizontalAlignment(Element.ALIGN_RIGHT);
        table.addCell(totalLabel);
        table.addCell(new PdfPCell(new Phrase(String.format("%.2f ₽", total), boldFont)));

        document.add(table);
        document.close();
        return out.toByteArray();
    }

    public byte[] exportTopProductsToPdf(int limit) throws DocumentException {
        List<TopProductDto> data = getTopProducts(limit);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4);
        PdfWriter.getInstance(document, out);
        document.open();

        Font titleFont = getCyrillicFont("Arial", 18, Font.BOLD);
        Font normalFont = getCyrillicFont("Arial", 10, Font.NORMAL);
        Font boldFont = getCyrillicFont("Arial", 10, Font.BOLD);

        Paragraph title = new Paragraph("Топ " + limit + " товаров бара", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);
        document.add(new Paragraph(" "));

        PdfPTable table = new PdfPTable(4);
        table.setWidthPercentage(100);

        table.addCell(new PdfPCell(new Phrase("ID", boldFont)));
        table.addCell(new PdfPCell(new Phrase("Название", boldFont)));
        table.addCell(new PdfPCell(new Phrase("Продано, шт", boldFont)));
        table.addCell(new PdfPCell(new Phrase("Выручка, ₽", boldFont)));

        for (TopProductDto dto : data) {
            table.addCell(new PdfPCell(new Phrase(String.valueOf(dto.getProductId()), normalFont)));
            table.addCell(new PdfPCell(new Phrase(dto.getProductName(), normalFont)));
            table.addCell(new PdfPCell(new Phrase(String.valueOf(dto.getTotalQuantity()), normalFont)));
            table.addCell(new PdfPCell(new Phrase(String.format("%.2f", dto.getTotalRevenue()), normalFont)));
        }

        double total = data.stream().mapToDouble(TopProductDto::getTotalRevenue).sum();
        PdfPCell totalLabel = new PdfPCell(new Phrase("Общая выручка:", boldFont));
        totalLabel.setColspan(3);
        totalLabel.setHorizontalAlignment(Element.ALIGN_RIGHT);
        table.addCell(totalLabel);
        table.addCell(new PdfPCell(new Phrase(String.format("%.2f ₽", total), boldFont)));

        document.add(table);
        document.close();
        return out.toByteArray();
    }

    public byte[] exportTopMerchandiseToPdf(int limit) throws DocumentException {
        List<TopMerchandiseDto> data = getTopMerchandise(limit);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4);
        PdfWriter.getInstance(document, out);
        document.open();

        Font titleFont = getCyrillicFont("Arial", 18, Font.BOLD);
        Font normalFont = getCyrillicFont("Arial", 10, Font.NORMAL);
        Font boldFont = getCyrillicFont("Arial", 10, Font.BOLD);

        Paragraph title = new Paragraph("Топ " + limit + " товаров мерча", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);
        document.add(new Paragraph(" "));

        PdfPTable table = new PdfPTable(4);
        table.setWidthPercentage(100);

        table.addCell(new PdfPCell(new Phrase("ID", boldFont)));
        table.addCell(new PdfPCell(new Phrase("Название", boldFont)));
        table.addCell(new PdfPCell(new Phrase("Продано, шт", boldFont)));
        table.addCell(new PdfPCell(new Phrase("Выручка, ₽", boldFont)));

        for (TopMerchandiseDto dto : data) {
            table.addCell(new PdfPCell(new Phrase(String.valueOf(dto.getMerchandiseId()), normalFont)));
            table.addCell(new PdfPCell(new Phrase(dto.getMerchandiseName(), normalFont)));
            table.addCell(new PdfPCell(new Phrase(String.valueOf(dto.getTotalQuantity()), normalFont)));
            table.addCell(new PdfPCell(new Phrase(String.format("%.2f", dto.getTotalRevenue()), normalFont)));
        }

        double total = data.stream().mapToDouble(TopMerchandiseDto::getTotalRevenue).sum();
        PdfPCell totalLabel = new PdfPCell(new Phrase("Общая выручка:", boldFont));
        totalLabel.setColspan(3);
        totalLabel.setHorizontalAlignment(Element.ALIGN_RIGHT);
        table.addCell(totalLabel);
        table.addCell(new PdfPCell(new Phrase(String.format("%.2f ₽", total), boldFont)));

        document.add(table);
        document.close();
        return out.toByteArray();
    }
    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        org.apache.poi.ss.usermodel.Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 11);
        style.setFont(font);

        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);

        style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);

        style.setAlignment(HorizontalAlignment.CENTER);
        return style;
    }

    private CellStyle createDataStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        return style;
    }

    private CellStyle createTitleStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        org.apache.poi.ss.usermodel.Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 14);
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        return style;
    }

    private CellStyle createCurrencyStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        CreationHelper createHelper = workbook.getCreationHelper();
        style.setDataFormat(createHelper.createDataFormat().getFormat("#,##0.00 ₽"));
        style.setAlignment(HorizontalAlignment.RIGHT);
        return style;
    }
}