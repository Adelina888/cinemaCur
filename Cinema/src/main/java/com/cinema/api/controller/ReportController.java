package com.cinema.api.controller;

import com.cinema.api.dto.SalesReportDto;
import com.cinema.api.dto.TopMerchandiseDto;
import com.cinema.api.dto.TopProductDto;
import com.cinema.api.service.ReportService;
import com.lowagie.text.DocumentException;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/top-products")
    public ResponseEntity<List<TopProductDto>> getTopProducts(@RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(reportService.getTopProducts(limit));
    }

    @GetMapping("/top-merchandise")
    public ResponseEntity<List<TopMerchandiseDto>> getTopMerchandise(@RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(reportService.getTopMerchandise(limit));
    }

    @GetMapping("/sales-data")
    public ResponseEntity<List<SalesReportDto>> getSalesData(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(reportService.getSalesReportData(start, end));
    }

    @GetMapping("/sales/excel")
    public ResponseEntity<byte[]> exportSalesToExcel(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) throws IOException {
        byte[] excel = reportService.exportSalesReportToExcel(start, end);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=sales_report.xlsx")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(excel);
    }

    @GetMapping("/top-products/excel")
    public ResponseEntity<byte[]> exportTopProductsToExcel(@RequestParam(defaultValue = "10") int limit) throws IOException {
        byte[] excel = reportService.exportTopProductsToExcel(limit);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=top_products.xlsx")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(excel);
    }
    @GetMapping("/top-merchandise/excel")
    public ResponseEntity<byte[]> exportTopMerchandiseToExcel(@RequestParam(defaultValue = "10") int limit) throws IOException {
        byte[] excel = reportService.exportTopMerchandiseToExcel(limit);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=top_merchandise.xlsx")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(excel);
    }

    @GetMapping("/sales/pdf")
    public ResponseEntity<byte[]> exportSalesToPdf(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) throws DocumentException {
        byte[] pdf = reportService.exportSalesReportToPdf(start, end);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=sales_report.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/top-products/pdf")
    public ResponseEntity<byte[]> exportTopProductsToPdf(@RequestParam(defaultValue = "10") int limit) throws DocumentException {
        byte[] pdf = reportService.exportTopProductsToPdf(limit);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=top_products.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/top-merchandise/pdf")
    public ResponseEntity<byte[]> exportTopMerchandiseToPdf(@RequestParam(defaultValue = "10") int limit) throws DocumentException {
        byte[] pdf = reportService.exportTopMerchandiseToPdf(limit);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=top_merchandise.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}