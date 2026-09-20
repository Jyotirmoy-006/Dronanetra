import React, { useState, useRef, useEffect } from "react";
import { Download, ChevronDown, FileSpreadsheet, FileCode, FileText, FileCheck, Check } from "lucide-react";
import { api } from "../services/api";

export default function ExportLogsDropdown({ telemetryData, history, nodeTitle = "Dronanetra TELEMETRY HUB" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [exportingFormat, setExportingFormat] = useState(null);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside or escape key
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(e) {
      if (e.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Helper to fetch latest history logs
  const fetchFullLogs = async () => {
    let exportData = history && history.length > 0 ? history : [];
    try {
      const res = await api.getHistory(300);
      if (res && res.history && res.history.length > 0) {
        exportData = res.history;
      }
    } catch (err) {
      console.warn("Using local history buffer for export:", err);
    }
    // If still empty, supply current live telemetry snapshot
    if (exportData.length === 0 && telemetryData) {
      exportData = [telemetryData];
    }
    return exportData;
  };

  // 1. Export as JSON
  const handleExportJSON = async () => {
    try {
      setExportingFormat("json");
      const logs = await fetchFullLogs();
      const payload = {
        aircraft: "TAPAS-BH201",
        system: "Dronanetra UAV Aero Piston Engine Digital Twin",
        node: nodeTitle,
        exported_at: new Date().toISOString(),
        total_samples: logs.length,
        current_telemetry_snapshot: telemetryData,
        telemetry_logs: logs,
      };

      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      triggerDownload(blob, `tapas_bh201_telemetry_${getTimestampStr()}.json`);
    } finally {
      finishExport();
    }
  };

  // 2. Export as CSV
  const handleExportCSV = async () => {
    try {
      setExportingFormat("csv");
      const logs = await fetchFullLogs();
      const headers = [
        "Timestamp",
        "RPM",
        "EGT_C",
        "CHT_C",
        "FuelFlow_L_hr",
        "Vibration_g",
        "OilPressure_bar",
        "OilTemp_C",
        "Throttle_pct",
        "Altitude_m",
        "HealthScore_pct",
        "AnomalyScore",
        "FaultStatus"
      ];

      const rows = logs.map((item) => [
        `"${item.timestamp || new Date().toISOString()}"`,
        item.telemetry?.rpm ?? item.rpm ?? 0,
        item.telemetry?.egt ?? item.egt ?? 0,
        item.telemetry?.cht ?? item.cht ?? 0,
        item.telemetry?.fuel_flow ?? item.fuel_flow ?? 0,
        item.telemetry?.vibration ?? item.vibration ?? 0,
        item.telemetry?.oil_pressure ?? item.oil_pressure ?? 3.8,
        item.telemetry?.oil_temp ?? item.oil_temp ?? 85.0,
        item.telemetry?.throttle ?? item.throttle ?? 75.0,
        item.telemetry?.altitude ?? item.altitude ?? 3200,
        item.health_score ?? item.health ?? 85,
        item.anomaly_score ?? 0,
        `"${item.fault_status || "NORMAL"}"`
      ]);

      const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      triggerDownload(blob, `tapas_bh201_telemetry_${getTimestampStr()}.csv`);
    } finally {
      finishExport();
    }
  };

  // 3. Export as Excel XML (.xls)
  const handleExportExcel = async () => {
    try {
      setExportingFormat("excel");
      const logs = await fetchFullLogs();
      const timestamp = new Date().toISOString();

      let xmlRows = logs.map((item) => `
        <Row>
          <Cell><Data ss:Type="String">${item.timestamp || timestamp}</Data></Cell>
          <Cell><Data ss:Type="Number">${item.telemetry?.rpm ?? item.rpm ?? 0}</Data></Cell>
          <Cell><Data ss:Type="Number">${item.telemetry?.egt ?? item.egt ?? 0}</Data></Cell>
          <Cell><Data ss:Type="Number">${item.telemetry?.cht ?? item.cht ?? 0}</Data></Cell>
          <Cell><Data ss:Type="Number">${item.telemetry?.fuel_flow ?? item.fuel_flow ?? 0}</Data></Cell>
          <Cell><Data ss:Type="Number">${item.telemetry?.vibration ?? item.vibration ?? 0}</Data></Cell>
          <Cell><Data ss:Type="Number">${item.telemetry?.oil_pressure ?? item.oil_pressure ?? 3.8}</Data></Cell>
          <Cell><Data ss:Type="Number">${item.telemetry?.oil_temp ?? item.oil_temp ?? 85.0}</Data></Cell>
          <Cell><Data ss:Type="Number">${item.telemetry?.throttle ?? item.throttle ?? 75.0}</Data></Cell>
          <Cell><Data ss:Type="Number">${item.telemetry?.altitude ?? item.altitude ?? 3200}</Data></Cell>
          <Cell><Data ss:Type="Number">${item.health_score ?? item.health ?? 85}</Data></Cell>
          <Cell><Data ss:Type="Number">${item.anomaly_score ?? 0}</Data></Cell>
          <Cell><Data ss:Type="String">${item.fault_status || "NORMAL"}</Data></Cell>
        </Row>
      `).join("");

      const excelXml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="Header">
   <Font ss:Bold="1" ss:Color="#FFFFFF" ss:Size="11"/>
   <Interior ss:Color="#0F2B38" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Telemetry Logs">
  <Table>
   <Row ss:StyleID="Header">
    <Cell><Data ss:Type="String">Timestamp</Data></Cell>
    <Cell><Data ss:Type="String">RPM</Data></Cell>
    <Cell><Data ss:Type="String">EGT (°C)</Data></Cell>
    <Cell><Data ss:Type="String">CHT (°C)</Data></Cell>
    <Cell><Data ss:Type="String">Fuel Flow (L/h)</Data></Cell>
    <Cell><Data ss:Type="String">Vibration (g)</Data></Cell>
    <Cell><Data ss:Type="String">Oil Pressure (bar)</Data></Cell>
    <Cell><Data ss:Type="String">Oil Temp (°C)</Data></Cell>
    <Cell><Data ss:Type="String">Throttle (%)</Data></Cell>
    <Cell><Data ss:Type="String">Altitude (m)</Data></Cell>
    <Cell><Data ss:Type="String">Health Score (%)</Data></Cell>
    <Cell><Data ss:Type="String">Anomaly Score</Data></Cell>
    <Cell><Data ss:Type="String">Fault Status</Data></Cell>
   </Row>
   ${xmlRows}
  </Table>
 </Worksheet>
</Workbook>`;

      const blob = new Blob([excelXml], { type: "application/vnd.ms-excel" });
      triggerDownload(blob, `tapas_bh201_telemetry_${getTimestampStr()}.xls`);
    } finally {
      finishExport();
    }
  };

  // 4. Export as PDF Printable Report
  const handleExportPDF = async () => {
    try {
      setExportingFormat("pdf");
      const logs = await fetchFullLogs();
      const current = telemetryData?.telemetry || {};
      const health = telemetryData?.health_score ?? 98.5;
      const fault = telemetryData?.fault_status || "NORMAL";
      const anomaly = telemetryData?.anomaly_score ?? 0.12;
      const exportTime = new Date().toUTCString();

      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        alert("Please allow popups to generate the PDF Mission Report.");
        return;
      }

      const tableRowsHtml = logs.slice(0, 50).map((l, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${l.timestamp ? l.timestamp.slice(11, 19) : "14:30:00"}</td>
          <td>${Math.round(l.telemetry?.rpm ?? l.rpm ?? 0)}</td>
          <td>${Number(l.telemetry?.egt ?? l.egt ?? 0).toFixed(1)}</td>
          <td>${Number(l.telemetry?.cht ?? l.cht ?? 0).toFixed(1)}</td>
          <td>${Number(l.telemetry?.fuel_flow ?? l.fuel_flow ?? 0).toFixed(1)}</td>
          <td>${Number(l.telemetry?.vibration ?? l.vibration ?? 0).toFixed(2)}</td>
          <td>${Number(l.telemetry?.oil_pressure ?? l.oil_pressure ?? 3.8).toFixed(1)}</td>
          <td>${Number(l.health_score ?? l.health ?? 85).toFixed(1)}%</td>
          <td style="color: ${l.fault_status !== "NORMAL" ? "#b91c1c" : "#047857"}; font-weight: bold;">
            ${l.fault_status || "NORMAL"}
          </td>
        </tr>
      `).join("");

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Dronanetra - TAPAS-BH201 Flight Telemetry Mission Report</title>
          <style>
            @page { size: A4 portrait; margin: 15mm; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.4; padding: 20px; }
            .header-box { display: flex; justify-content: space-between; border-bottom: 2px solid #0f766e; padding-bottom: 12px; margin-bottom: 20px; }
            .header-title h1 { margin: 0; font-size: 20px; color: #0f172a; letter-spacing: 0.5px; }
            .header-title p { margin: 4px 0 0 0; font-size: 11px; color: #64748b; font-weight: 600; }
            .header-meta { text-align: right; font-size: 11px; color: #475569; }
            .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
            .kpi-card { border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; background: #f8fafc; }
            .kpi-card .lbl { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; }
            .kpi-card .val { font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 4px; }
            table { width: 100%; border-collapse: collapse; font-size: 10px; margin-top: 10px; }
            th { background: #0f2b38; color: #ffffff; text-align: left; padding: 6px 8px; font-size: 10px; font-weight: 700; }
            td { padding: 5px 8px; border-bottom: 1px solid #e2e8f0; }
            tr:nth-child(even) td { background: #f8fafc; }
            .footer-note { margin-top: 30px; font-size: 9px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 8px; }
            @media print {
              .no-print { display: none; }
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="margin-bottom: 16px; background: #e0f2fe; padding: 10px 16px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 12px; font-weight: 600; color: #0369a1;">Telemetry Report Ready for Print / PDF Export</span>
            <button onclick="window.print()" style="background: #0284c7; color: #fff; border: none; padding: 6px 14px; border-radius: 4px; font-weight: bold; cursor: pointer;">Print / Save as PDF</button>
          </div>

          <div class="header-box">
            <div class="header-title">
              <h1>Dronanetra // TAPAS-BH201 DIGITAL TWIN</h1>
              <p>Aero-Piston Engine Telemetry & Predictive Health Executive Audit</p>
            </div>
            <div class="header-meta">
              <div><strong>Export Date:</strong> ${exportTime}</div>
              <div><strong>Node:</strong> ${nodeTitle}</div>
              <div><strong>Platform:</strong> MALE UAV Propulsion Unit</div>
            </div>
          </div>

          <div class="kpi-grid">
            <div class="kpi-card">
              <div class="lbl">Engine Health</div>
              <div class="val" style="color: ${health > 80 ? "#059669" : "#d97706"};">${health.toFixed(1)}%</div>
            </div>
            <div class="kpi-card">
              <div class="lbl">AI Fault Status</div>
              <div class="val">${fault}</div>
            </div>
            <div class="kpi-card">
              <div class="lbl">Engine Speed / CHT</div>
              <div class="val">${Math.round(current.rpm || 5180)} RPM / ${Number(current.cht || 148).toFixed(1)}°C</div>
            </div>
            <div class="kpi-card">
              <div class="lbl">Total Buffer Frames</div>
              <div class="val">${logs.length} Frames</div>
            </div>
          </div>

          <h3 style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin: 16px 0 6px 0; color: #334155;">
            Chronological Telemetry Stream Log (Sample Preview)
          </h3>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Time (UTC)</th>
                <th>RPM</th>
                <th>EGT (°C)</th>
                <th>CHT (°C)</th>
                <th>Fuel (L/h)</th>
                <th>Vib (g)</th>
                <th>Oil (bar)</th>
                <th>Health</th>
                <th>Fault Status</th>
              </tr>
            </thead>
            <tbody>
              ${tableRowsHtml}
            </tbody>
          </table>

          <div class="footer-note">
            CONFIDENTIAL & PROPRIETARY — DEFENCE RESEARCH AND DEVELOPMENT ORGANISATION (DRDO) // DRONANETRA DEFENCE INNOVATION
          </div>

          <script>
            window.onload = function() {
              setTimeout(function() { window.print(); }, 500);
            };
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
    } finally {
      finishExport();
    }
  };

  const triggerDownload = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getTimestampStr = () => {
    return new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  };

  const finishExport = () => {
    setTimeout(() => {
      setExportingFormat(null);
      setIsOpen(false);
    }, 600);
  };

  return (
    <div className="export-dropdown-wrapper" ref={dropdownRef}>
      <button
        className="btn-action-outline export-main-trigger"
        onClick={() => setIsOpen((prev) => !prev)}
        disabled={exportingFormat !== null}
        title="Export Telemetry Logs in CSV, Excel, JSON, or PDF"
      >
        <Download size={14} className={exportingFormat ? "spin" : ""} />
        <span>{exportingFormat ? `EXPORTING ${exportingFormat.toUpperCase()}...` : "EXPORT LOGS"}</span>
        <ChevronDown size={13} style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
      </button>

      {isOpen && (
        <div className="export-menu-card">
          <div className="export-menu-header">
            <span>SELECT EXPORT FORMAT</span>
          </div>

          <button className="export-menu-item" onClick={handleExportCSV}>
            <div className="export-item-icon csv">
              <FileText size={15} />
            </div>
            <div className="export-item-meta">
              <div className="export-item-title">CSV Document (.csv)</div>
              <div className="export-item-sub">Comma-separated matrix for analysis & Pandas</div>
            </div>
          </button>

          <button className="export-menu-item" onClick={handleExportExcel}>
            <div className="export-item-icon excel">
              <FileSpreadsheet size={15} />
            </div>
            <div className="export-item-meta">
              <div className="export-item-title">Excel Spreadsheet (.xls)</div>
              <div className="export-item-sub">Formatted Microsoft Excel workbook with styles</div>
            </div>
          </button>

          <button className="export-menu-item" onClick={handleExportJSON}>
            <div className="export-item-icon json">
              <FileCode size={15} />
            </div>
            <div className="export-item-meta">
              <div className="export-item-title">JSON Raw Stream (.json)</div>
              <div className="export-item-sub">Full hierarchical telemetry logs with metadata</div>
            </div>
          </button>

          <button className="export-menu-item" onClick={handleExportPDF}>
            <div className="export-item-icon pdf">
              <FileCheck size={15} />
            </div>
            <div className="export-item-meta">
              <div className="export-item-title">PDF Mission Report (.pdf)</div>
              <div className="export-item-sub">Dronanetra executive telemetry & health report</div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
