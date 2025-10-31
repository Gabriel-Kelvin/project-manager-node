import React, { useState } from 'react';
import { Download, FileText, Table } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import useAnalyticsStore from '../../store/analyticsStore';
import { toast } from '../Toast';

const ExportButton = ({ projectId }) => {
  const [showModal, setShowModal] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');
  const [isExporting, setIsExporting] = useState(false);
  
  const { 
    projectAnalytics, 
    timelineData, 
    getKPIMetrics,
    getTaskDistributionData,
    getPriorityDistributionData,
    getTeamPerformanceData
  } = useAnalyticsStore();

  const handleExport = async () => {
    if (!projectAnalytics) {
      toast.error('No analytics data available to export');
      return;
    }

    setIsExporting(true);
    
    try {
      if (exportFormat === 'pdf') {
        await exportToPDF();
      } else {
        await exportToCSV();
      }
      
      toast.success(`Analytics exported as ${exportFormat.toUpperCase()} successfully!`);
      setShowModal(false);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export analytics');
    } finally {
      setIsExporting(false);
    }
  };

  const exportToPDF = async () => {
    try {
      const kpiMetrics = getKPIMetrics();
      const taskDistribution = getTaskDistributionData();
      const priorityDistribution = getPriorityDistributionData();
      const teamPerformance = getTeamPerformanceData();

      // Create new PDF document
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;

      // Helper function to add text with word wrap
      const addText = (text, x, y, maxWidth = pageWidth - 40) => {
        const lines = pdf.splitTextToSize(text, maxWidth);
        pdf.text(lines, x, y);
        return y + (lines.length * 7);
      };

      // Helper function to add a new page if needed
      const checkNewPage = (requiredSpace = 20) => {
        if (yPosition + requiredSpace > pageHeight - 20) {
          pdf.addPage();
          yPosition = 20;
        }
      };

      // Title
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      yPosition = addText('Project Analytics Report', 20, yPosition);
      
      // Project info
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      yPosition = addText(`Project ID: ${projectId}`, 20, yPosition + 10);
      yPosition = addText(`Generated: ${new Date().toLocaleDateString()}`, 20, yPosition + 5);
      
      yPosition += 10;
      checkNewPage();

      // KPI Metrics Section
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      yPosition = addText('Key Performance Indicators', 20, yPosition);
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      if (kpiMetrics) {
        yPosition = addText(`Overall Progress: ${kpiMetrics.overallProgress}%`, 20, yPosition + 5);
        yPosition = addText(`Total Tasks: ${kpiMetrics.totalTasks}`, 20, yPosition + 5);
        yPosition = addText(`Team Productivity: ${kpiMetrics.teamProductivity}%`, 20, yPosition + 5);
        yPosition = addText(`On-time Completion: ${kpiMetrics.onTimeCompletion}%`, 20, yPosition + 5);
      }
      
      yPosition += 10;
      checkNewPage();

      // Task Distribution Section
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      yPosition = addText('Task Distribution', 20, yPosition);
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      taskDistribution.forEach(item => {
        yPosition = addText(`${item.name}: ${item.value} tasks`, 20, yPosition + 5);
      });
      
      yPosition += 10;
      checkNewPage();

      // Priority Distribution Section
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      yPosition = addText('Priority Distribution', 20, yPosition);
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      priorityDistribution.forEach(item => {
        yPosition = addText(`${item.priority}: ${item.count} tasks`, 20, yPosition + 5);
      });
      
      yPosition += 10;
      checkNewPage();

      // Team Performance Section
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      yPosition = addText('Team Performance', 20, yPosition);
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      teamPerformance.forEach(member => {
        checkNewPage(15);
        yPosition = addText(`${member.username} (${member.role})`, 20, yPosition + 5);
        yPosition = addText(`  Tasks Assigned: ${member.tasksAssigned}`, 20, yPosition + 3);
        yPosition = addText(`  Tasks Completed: ${member.tasksCompleted}`, 20, yPosition + 3);
        yPosition = addText(`  Completion Rate: ${member.completionRate}%`, 20, yPosition + 3);
        yPosition = addText(`  Avg. Completion Time: ${member.averageCompletionTime} days`, 20, yPosition + 3);
        yPosition += 5;
      });

      // Save the PDF
      const fileName = `project-analytics-${projectId}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('PDF export failed:', error);
      throw new Error('Failed to generate PDF report');
    }
  };

  const exportToCSV = async () => {
    const kpiMetrics = getKPIMetrics();
    const teamPerformance = getTeamPerformanceData();

    // Create CSV content
    let csvContent = 'Project Analytics Export\n\n';
    
    // KPI Metrics
    csvContent += 'KPI Metrics\n';
    csvContent += 'Metric,Value\n';
    csvContent += `Overall Progress,${kpiMetrics.overallProgress}%\n`;
    csvContent += `Total Tasks,${kpiMetrics.totalTasks}\n`;
    csvContent += `Team Productivity,${kpiMetrics.teamProductivity}%\n`;
    csvContent += `On-time Completion,${kpiMetrics.onTimeCompletion}%\n\n`;

    // Team Performance
    csvContent += 'Team Performance\n';
    csvContent += 'Username,Role,Tasks Assigned,Tasks Completed,Completion Rate,Average Completion Time,Last Active\n';
    teamPerformance.forEach(member => {
      csvContent += `${member.username},${member.role},${member.tasksAssigned},${member.tasksCompleted},${member.completionRate}%,${member.averageCompletionTime} days,${member.lastActive}\n`;
    });

    // Create and download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `project-analytics-${projectId}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2"
      >
        <Download className="w-4 h-4" />
        Export
      </Button>

      {showModal && (
        <Modal isOpen onClose={() => setShowModal(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Export Analytics</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowModal(false)}
                className="p-2"
              >
                ×
              </Button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-gray-600">
                Choose the format for exporting your analytics data.
              </p>

              <div className="space-y-3">
                <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="exportFormat"
                    value="pdf"
                    checked={exportFormat === 'pdf'}
                    onChange={(e) => setExportFormat(e.target.value)}
                    className="mr-3"
                  />
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-red-500" />
                    <div>
                      <div className="font-medium text-gray-900">PDF Report</div>
                      <div className="text-sm text-gray-600">
                        Complete analytics report with charts and metrics
                      </div>
                    </div>
                  </div>
                </label>

                <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="exportFormat"
                    value="csv"
                    checked={exportFormat === 'csv'}
                    onChange={(e) => setExportFormat(e.target.value)}
                    className="mr-3"
                  />
                  <div className="flex items-center gap-3">
                    <Table className="w-5 h-5 text-green-500" />
                    <div>
                      <div className="font-medium text-gray-900">CSV Data</div>
                      <div className="text-sm text-gray-600">
                        Raw data in spreadsheet format for analysis
                      </div>
                    </div>
                  </div>
                </label>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="text-sm text-blue-700">
                  <strong>Note:</strong> The export will include all visible analytics data including KPI metrics, team performance, and task distributions.
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <Button
                variant="outline"
                onClick={() => setShowModal(false)}
                disabled={isExporting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleExport}
                disabled={isExporting}
                className="flex items-center gap-2 min-w-24"
              >
                {isExporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Export
                  </>
                )}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default ExportButton;
