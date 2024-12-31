import React, { useEffect, useState } from "react";
import Sidebar from "../../../components/sideBar";
import TopBar from "../../../components/topBar";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { IoMdSearch } from "react-icons/io";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";

export default function Index() {
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState([]);
  const [agents, setAgents] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [orderBy, setOrderBy] = useState("id");
  const [orderType, setOrderType] = useState("ASC");
  const [page, setPage] = useState("1");
  const [condition, setCondition] = useState({
    key: "expiration",
    value: "",
    criteria: ">",
  });

  // Fetch agents data
  const fetchAgents = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Authorization token is missing. Please log in again.");
      return;
    }

    try {
      const myHeaders = new Headers();
      myHeaders.append("Authorization", token);

      const response = await fetch(
        "http://192.168.69.50:8069/jt_api/ftth_agent/profile",
        {
          method: "GET",
          headers: myHeaders,
          redirect: "follow",
        }
      );

      if (!response.ok) {
        throw new Error("Error fetching agents data");
      }

      const result = await response.json();
      setAgents(result.data.agents || []);

      // Set default selected agent if coming from profile page
      if (location.state?.selectedAgentId) {
        setSelectedAgentId(location.state.selectedAgentId);
      } else if (result.data.agents.length > 0) {
        setSelectedAgentId(result.data.agents[0].id);
      }
    } catch (error) {
      console.error("Error fetching agents:", error);
      setError(error.message);
    }
  };

  useEffect(() => {
    if (location.state?.condition) {
      setCondition(location.state.condition);
    }
  }, [location.state]);

  // Convert bytes to MB
  const bytesToMB = (bytes) => {
    return (bytes / (1024 * 1024)).toFixed(2);
  };

  const fetchData = async () => {
    if (!selectedAgentId) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Authorization token is missing. Please log in again.");
      setIsLoading(false);
      return;
    }

    try {
      const myHeaders = new Headers();
      myHeaders.append("Authorization", token);

      let url = new URL(
        "http://192.168.69.50:8069/jt_api/ftth_enduser/endusers"
      );

      const params = new URLSearchParams({
        agent_id: selectedAgentId,
        search: searchQuery,
        page: page,
        order_by: orderBy,
        order_ty: orderType,
      });

      if (condition.key && condition.value) {
        params.append("condition_key", condition.key);
        params.append("condition_value", condition.value);
        params.append("condition_criteria", condition.criteria);
      }

      url.search = params.toString();

      const response = await fetch(url, {
        method: "GET",
        headers: myHeaders,
        redirect: "follow",
      });

      if (!response.ok) {
        throw new Error("Error fetching data");
      }

      const result = await response.json();
      setData(result.data || []);
      setIsLoading(false);
    } catch (error) {
      setError(error.message);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  useEffect(() => {
    if (selectedAgentId) {
      fetchData();
    }
  }, [selectedAgentId, searchQuery, orderBy, orderType, condition]);

  // Helper function to render `null` or `N/A` for `false` values
  const renderValue = (value) => (value === false ? "N/A" : value);

  // Handle Search Query Change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle Order Change
  const handleOrderChange = (e) => {
    setOrderBy(e.target.value);
  };

  // Handle Order Type Change
  const handleOrderTypeChange = (e) => {
    setOrderType(e.target.value);
  };

  // Handle Condition Change
  const handleConditionChange = (e) => {
    const { name, value } = e.target;
    setCondition((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    fetchData();
  }, [searchQuery, orderBy, orderType, condition]);

  const naviageToUser = (userData) => {
    navigate(`/enduser/${userData.id}`, {
      state: { userData },
    });
  };

  return (
    <div className="flex py-5 pr-10 pl-5 pb-20">
      <Sidebar isMobile={false} />
      <div className="content flex-1">
        <TopBar />

        <div className="mb-4">
          <h2 className="intro-y text-lg font-medium mt-10">User List</h2>
          <div className="grid grid-cols-12 gap-6 mt-5">
            <div className="intro-y col-span-12 flex flex-wrap gap-3 items-center mt-2">
              <div className="intro-x relative">
                <div className="search hidden sm:block">
                  <input
                    type="text"
                    className="search__input form-control border-transparent"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                  <IoMdSearch className="search__icon dark:text-slate-500" />
                </div>
              </div>

              <select
                value={selectedAgentId}
                onChange={(e) => setSelectedAgentId(e.target.value)}
                className="form-select w-full sm:w-40"
              >
                <option value="" disabled>
                  Select Agent
                </option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.firstname} {agent.lastname}
                  </option>
                ))}
              </select>

              <select
                value={orderBy}
                onChange={handleOrderChange}
                className="form-select w-full sm:w-40"
              >
                <option value="id">ID</option>
                <option value="username">Username</option>
                <option value="firstname">First Name</option>
                <option value="lastname">Last Name</option>
                <option value="expiration">Expiration</option>
                <option value="created_at">Created At</option>
              </select>

              <select
                value={orderType}
                onChange={handleOrderTypeChange}
                className="form-select w-full sm:w-40"
              >
                <option value="ASC">Ascending</option>
                <option value="DESC">Descending</option>
              </select>

              <select
                name="key"
                value={condition.key}
                onChange={handleConditionChange}
                className="form-select w-full sm:w-40"
              >
                <option value="" disabled>Select Condition</option>
                <option value="enabled">Enabled</option>
                <option value="expiration">Expiration</option>
                <option value="created_at">Created At</option>
                <option value="online">Online</option>
              </select>

              {condition.key && (
                <div className="w-full sm:w-40">
                  {["enabled", "online"].includes(condition.key) ? (
                    <select
                      name="value"
                      value={condition.value}
                      onChange={handleConditionChange}
                      className="form-select w-full"
                    >
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  ) : (
                    <input
                      type="date"
                      name="value"
                      value={condition.value}
                      onChange={handleConditionChange}
                      className="form-control w-full"
                    />
                  )}
                </div>
              )}

              {condition.key && (
                <select
                  name="criteria"
                  value={condition.criteria}
                  onChange={handleConditionChange}
                  className="form-select w-full sm:w-40"
                >
                  <option value="=">=</option>
                  <option value="!=">!=</option>
                  <option value=">">&gt;</option>
                  <option value="<">&lt;</option>
                </select>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="intro-y col-span-12 overflow-auto lg:overflow-visible">
          <table className="table table-report -mt-2">
            <thead>
              <tr>
                <th className="whitespace-nowrap">#ID</th>
                <th className="whitespace-nowrap">NAME</th>
                <th className="text-center whitespace-nowrap">Phone</th>
                <th className="text-center whitespace-nowrap">Online</th>
                <th className="text-center whitespace-nowrap">Expiration</th>
                <th className="text-center whitespace-nowrap">
                  Current Upload
                </th>
                <th className="text-center whitespace-nowrap">
                  Current Download
                </th>
                <th className="text-center whitespace-nowrap">Profile</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="8" className="text-center">
                    Loading...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="8" className="text-center text-red-500">
                    {error}
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr key={item.id} className="intro-x">
                    <td className="w-40">{item.id}</td>
                    <td>
                      <a href="#" className="font-medium whitespace-nowrap">
                        {renderValue(item.name)}
                      </a>
                      <div className="text-slate-500 text-xs whitespace-nowrap mt-0.5">
                        {item.username}
                      </div>
                    </td>
                    <td className="text-center">{renderValue(item.phone)}</td>
                    <td className="text-center">
                      {item.online ? (
                        <div className="flex items-center justify-center text-success">
                          <i
                            data-lucide="check-square"
                            className="w-4 h-4 mr-2"
                          />{" "}
                          Active
                        </div>
                      ) : (
                        <div className="flex items-center justify-center text-danger">
                          <i data-lucide="x-square" className="w-4 h-4 mr-2" />{" "}
                          Inactive
                        </div>
                      )}
                    </td>
                    <td className="text-center">
                      {renderValue(item.expiration)}
                    </td>
                    <td className="text-center">{`${bytesToMB(
                      item.current_upload
                    )} MB`}</td>
                    <td className="text-center">{`${bytesToMB(
                      item.current_download
                    )} MB`}</td>
                    <td>
                      {" "}
                      <div className="flex mt-4 lg:mt-0">
                        {/* // Then update the button onClick in the table: */}
                        <button
                          onClick={() => naviageToUser(item)}
                          className="btn btn-primary py-1 px-4"
                        >
                          View
                          <MdOutlineKeyboardArrowRight className="text-xl" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
