package com.cinema.api.service;

import com.cinema.api.dto.*;
import com.cinema.api.entity.*;
import com.cinema.api.repository.*;
import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.apache.poi.ss.usermodel.*;
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

    // ========== Анализ популярности ==========

    @Transactional(readOnly = true)
    public List<TopProductDto> getTopProducts(int limit) {
        // Получаем все товары бара
        List<Product> products = productRepository.findAll();
        Map<Long, TopProductDto> stats = new HashMap<>();

        for (Product product : products) {
            Integer soldQuantity = comboProductRepository.sumQuantityByProductId(product.getId());
            if (soldQuantity == null) soldQuantity = 0;
            // Цену берём текущую (упрощённо)
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

    // ========== Отчёт по продажам ==========

    @Transactional(readOnly = true)
    public List<SalesReportDto> getSalesReportData(LocalDateTime start, LocalDateTime end) {
        List<Receipt> receipts = receiptRepository.findByDateRange(start, end);
        return receipts.stream()
                .filter(r -> "SALE".equals(r.getTypeOfOperation()))
                .map(r -> new SalesReportDto(r.getId(), r.getDate(), r.getPaymentMethod(), r.getTotalAmount()))
                .collect(Collectors.toList());
    }

    // ========== Экспорт в Excel ==========

    public byte[] exportSalesReportToExcel(LocalDateTime start, LocalDateTime end) throws IOException {
        List<SalesReportDto> data = getSalesReportData(start, end);

        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Отчёт по продажам");

        // Заголовки
        Row header = sheet.createRow(0);
        header.createCell(0).setCellValue("ID чека");
        header.createCell(1).setCellValue("Дата");
        header.createCell(2).setCellValue("Способ оплаты");
        header.createCell(3).setCellValue("Сумма");

        // Данные
        int rowNum = 1;
        for (SalesReportDto dto : data) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(dto.getReceiptId());
            row.createCell(1).setCellValue(dto.getDate().format(DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm")));
            row.createCell(2).setCellValue(dto.getPaymentMethod());
            row.createCell(3).setCellValue(dto.getTotalAmount());
        }

        // Автоширина колонок
        for (int i = 0; i < 4; i++) {
            sheet.autoSizeColumn(i);
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

        Row header = sheet.createRow(0);
        header.createCell(0).setCellValue("ID товара");
        header.createCell(1).setCellValue("Название");
        header.createCell(2).setCellValue("Продано, шт");
        header.createCell(3).setCellValue("Выручка");

        int rowNum = 1;
        for (TopProductDto dto : data) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(dto.getProductId());
            row.createCell(1).setCellValue(dto.getProductName());
            row.createCell(2).setCellValue(dto.getTotalQuantity());
            row.createCell(3).setCellValue(dto.getTotalRevenue());
        }

        for (int i = 0; i < 4; i++) sheet.autoSizeColumn(i);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        workbook.write(out);
        workbook.close();
        return out.toByteArray();
    }

    // ========== Экспорт в PDF (OpenPDF) ==========

    public byte[] exportSalesReportToPdf(LocalDateTime start, LocalDateTime end) throws DocumentException {
        List<SalesReportDto> data = getSalesReportData(start, end);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4);
        PdfWriter.getInstance(document, out);
        document.open();

        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
        Paragraph title = new Paragraph("Отчёт по продажам", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);

        document.add(new Paragraph(" "));
        document.add(new Paragraph("Период: " + start.format(DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm")) +
                " – " + end.format(DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm"))));
        document.add(new Paragraph(" "));

        PdfPTable table = new PdfPTable(4);
        table.setWidthPercentage(100);
        table.addCell("ID чека");
        table.addCell("Дата");
        table.addCell("Способ оплаты");
        table.addCell("Сумма");

        for (SalesReportDto dto : data) {
            table.addCell(String.valueOf(dto.getReceiptId()));
            table.addCell(dto.getDate().format(DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm")));
            table.addCell(dto.getPaymentMethod());
            table.addCell(String.valueOf(dto.getTotalAmount()));
        }

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

        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
        Paragraph title = new Paragraph("Топ " + limit + " товаров бара", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);
        document.add(new Paragraph(" "));

        PdfPTable table = new PdfPTable(4);
        table.setWidthPercentage(100);
        table.addCell("ID");
        table.addCell("Название");
        table.addCell("Продано, шт");
        table.addCell("Выручка");

        for (TopProductDto dto : data) {
            table.addCell(String.valueOf(dto.getProductId()));
            table.addCell(dto.getProductName());
            table.addCell(String.valueOf(dto.getTotalQuantity()));
            table.addCell(String.valueOf(dto.getTotalRevenue()));
        }

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

        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
        Paragraph title = new Paragraph("Топ " + limit + " товаров мерча", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);
        document.add(new Paragraph(" "));

        PdfPTable table = new PdfPTable(4);
        table.setWidthPercentage(100);
        table.addCell("ID");
        table.addCell("Название");
        table.addCell("Продано, шт");
        table.addCell("Выручка");

        for (TopMerchandiseDto dto : data) {
            table.addCell(String.valueOf(dto.getMerchandiseId()));
            table.addCell(dto.getMerchandiseName());
            table.addCell(String.valueOf(dto.getTotalQuantity()));
            table.addCell(String.valueOf(dto.getTotalRevenue()));
        }

        document.add(table);
        document.close();
        return out.toByteArray();
    }
}