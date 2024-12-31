import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../../../components/sideBar";
import TopBar from "../../../components/topBar";
import {
  User,
  Hash,
  Clock,
  FileText,
  AlertCircle,
  Phone,
  Mail,
  Home,
  FileCheck,
  BookOpen,
} from "lucide-react";
import Comment from "./commints/comments";
import "./style.css";

export default function SubmissionView() {
  const { id } = useParams();
  const [submissionData, setSubmissionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch function and useEffect remain the same...
  useEffect(() => {
    const fetchSubmissionData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authorization token is missing. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        const myHeaders = new Headers();
        myHeaders.append("Authorization", token);

        const response = await fetch(
          `http://192.168.69.50:8069/jt_api/ftth_enduser/provision/submission_view?submission_id=${id}`,
          {
            method: "GET",
            headers: myHeaders,
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch submission details");
        }

        const data = await response.json();
        if (data.status === "success") {
          setSubmissionData(data.data);
        } else {
          throw new Error(data.message || "Failed to fetch submission details");
        }
      } catch (error) {
        setError(
          error.message || "An error occurred while fetching submission details"
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchSubmissionData();
    } else {
      setError("No submission ID provided");
      setLoading(false);
    }
  }, [id]);

  // Loading and error states remain the same...
  if (loading) {
    return (
      <div className="flex py-5 pr-10 pl-5 pb-20">
        <Sidebar isMobile={false} />
        <div className="content flex-1">
          <TopBar />
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex py-5 pr-10 pl-5 pb-20">
        <Sidebar isMobile={false} />
        <div className="content flex-1">
          <TopBar />
          <div className="text-center p-4 text-red-500">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!submissionData) {
    return (
      <div className="flex py-5 pr-10 pl-5 pb-20">
        <Sidebar isMobile={false} />
        <div className="content flex-1">
          <TopBar />
          <div className="text-center p-4">No submission data available</div>
        </div>
      </div>
    );
  }

  const InfoSection = ({ title, children }) => (
    <div className="box p-5 mt-5">
      <h3 className="text-lg font-medium mb-4">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </div>
  );

  const InfoItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-center mb-3">
      <Icon className="w-4 h-4 mr-2 text-slate-500" />
      <span className="text-slate-500">{label}:</span>
      <span className="ml-2 font-medium">{value || "N/A"}</span>
    </div>
  );

  return (
    <div className="flex py-5 pr-10 pl-5 pb-20">
      <Sidebar isMobile={false} />
      <div className="content flex-1">
        <TopBar />
        <div className="grid-layout">
          {/* Submission Details Section */}
          <div className="submission-card">
            <h2 className="text-lg font-medium mb-4">
              Submission #{submissionData?.id}
            </h2>
            <div></div>
            {/* Status Box */}
            <div className="box sm:flex mt-5">
              <div className="px-8 py-8 flex flex-col justify-center flex-1">
                <div className="text-3xl font-medium">
                  {/* Status: <span className={`text-${submissionData.state === 'requires_fix' ? 'warning' : 'primary'}`}>{submissionData.state}</span> */}
                </div>
                <div className="mt-4">
                  <InfoItem
                    icon={User}
                    label="Username"
                    value={submissionData.name}
                  />
                  <InfoItem
                    icon={FileText}
                    label="Password"
                    value={submissionData.password}
                  />
                </div>
              </div>

              <div className="px-8 py-8 flex flex-col justify-center flex-1 border-t sm:border-t-0 sm:border-l border-slate-200 border-dashed">
                <InfoItem
                  icon={User}
                  label="Created By"
                  value={submissionData.created_by.name}
                />
                <InfoItem
                  icon={Clock}
                  label="Created At"
                  value={new Date(submissionData.created_at).toLocaleString()}
                />
                <InfoItem
                  icon={User}
                  label="Agent"
                  value={submissionData.agent_id.name}
                />
              </div>
            </div>

            {/* Personal and Technical Details in one row */}
            <div className="grid grid-cols-2 gap-5">
              <InfoSection title="Personal Details">
                <div>
                  <InfoItem
                    icon={User}
                    label="First Name"
                    value={submissionData.first_name}
                  />
                  <InfoItem
                    icon={User}
                    label="Middle Name"
                    value={submissionData.mid_name}
                  />
                  <InfoItem
                    icon={User}
                    label="Last Name"
                    value={submissionData.last_name}
                  />
                  <InfoItem
                    icon={User}
                    label="Family Name"
                    value={submissionData.family_name}
                  />
                  <InfoItem
                    icon={User}
                    label="Mother's Name"
                    value={submissionData.mother_name}
                  />
                </div>
                <div>
                  <InfoItem
                    icon={Clock}
                    label="Birthday"
                    value={submissionData.birthday}
                  />
                  <InfoItem
                    icon={Phone}
                    label="Phone"
                    value={submissionData.phone}
                  />
                  <InfoItem
                    icon={Mail}
                    label="Email"
                    value={submissionData.email}
                  />
                  <InfoItem
                    icon={FileCheck}
                    label="Phone Verified"
                    value={submissionData.phone_verified ? "Yes" : "No"}
                  />
                </div>
              </InfoSection>

              <InfoSection title="Technical Details">
                <div>
                  <InfoItem
                    icon={Hash}
                    label="ONT Serial"
                    value={submissionData.ont_serial}
                  />
                  <InfoItem
                    icon={Hash}
                    label="SAS Profile ID"
                    value={submissionData.sas_profile_id}
                  />
                  <InfoItem
                    icon={Hash}
                    label="Port"
                    value={submissionData.port.name}
                  />
                  <InfoItem
                    icon={Hash}
                    label="FAT"
                    value={submissionData.fat.name}
                  />
                </div>
                <div>
                  <InfoItem
                    icon={Hash}
                    label="FDT"
                    value={submissionData.fdt.name}
                  />
                  <InfoItem
                    icon={Hash}
                    label="Project"
                    value={submissionData.project.name}
                  />
                  <InfoItem
                    icon={Hash}
                    label="Region"
                    value={submissionData.region.name}
                  />
                  <InfoItem
                    icon={Hash}
                    label="Port Sub ID"
                    value={submissionData.port_sub_id}
                  />
                </div>
              </InfoSection>
            </div>

            <div className="grid grid-cols-2 gap-5">
              {/* Address Information */}
              <InfoSection title="Address Information">
                <div>
                  <InfoItem
                    icon={Home}
                    label="Address Type"
                    value={submissionData.address_type}
                  />
                  <InfoItem
                    icon={Home}
                    label="Hai"
                    value={submissionData.address_hai}
                  />
                  <InfoItem
                    icon={Home}
                    label="Mahala"
                    value={submissionData.address_mahala}
                  />
                  <InfoItem
                    icon={Home}
                    label="Zukak"
                    value={submissionData.address_zukak}
                  />
                  <InfoItem
                    icon={Home}
                    label="Dar"
                    value={submissionData.address_dar}
                  />
                </div>
                <div>
                  <InfoItem
                    icon={Home}
                    label="Compound"
                    value={submissionData.address_compound}
                  />
                  <InfoItem
                    icon={Home}
                    label="Block"
                    value={submissionData.address_compound_block}
                  />
                  <InfoItem
                    icon={Home}
                    label="Building"
                    value={submissionData.address_compound_building}
                  />
                  <InfoItem
                    icon={Home}
                    label="Apartment"
                    value={submissionData.address_compound_apartment}
                  />
                  <InfoItem
                    icon={Home}
                    label="Nearest Point"
                    value={submissionData.address_nearest_point}
                  />
                </div>
              </InfoSection>

              {/* Document Information */}
              <InfoSection title="Document Information">
                <div>
                  <InfoItem
                    icon={FileText}
                    label="Document Type"
                    value={submissionData.document_type}
                  />
                  <InfoItem
                    icon={BookOpen}
                    label="Review Submitted"
                    value={submissionData.review_submitted ? "Yes" : "No"}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="flex flex-col items-center">
                    <h4 className="font-medium mb-2">Document Face</h4>
                    {submissionData.document_face ? (
                      <img
                        src={submissionData.document_face}
                        alt="Document Face"
                        className="w-64 h-100 border border-gray-300 rounded"
                      />
                    ) : (
                      <span className="text-gray-500">No image available</span>
                    )}
                  </div>
                  <div className="flex flex-col items-center">
                    <h4 className="font-medium mb-2">Document Back</h4>
                    {submissionData.document_back ? (
                      <img
                        src={submissionData.document_back}
                        alt="Document Back"
                        className="w-64 h-100 border border-gray-300 rounded"
                      />
                    ) : (
                      <span className="text-gray-500">No image available</span>
                    )}
                  </div>
                  <div className="flex flex-col items-center">
                    <h4 className="font-medium mb-2">Signature</h4>
                    {submissionData.signature ? (
                      <img
                        src={submissionData.signature}
                        alt="Signature"
                        className="w-64 h-100 border border-gray-300 rounded"
                      />
                    ) : (
                      <span className="text-gray-500">No image available</span>
                    )}
                  </div>
                </div>
              </InfoSection>
            </div>
          </div>

          <div className="comments-card">
            <Comment />
          </div>
        </div>
      </div>
    </div>
  );
}
