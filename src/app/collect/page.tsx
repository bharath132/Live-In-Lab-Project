"use client";

import { useState, useEffect } from "react";
import {
  Trash2,
  MapPin,
  CheckCircle,
  Clock,
  Upload,
  Loader,
  Calendar,
  Weight,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";

type CollectionTask = {
  id: number;
  location: string;
  wasteType: string;
  amount: string;
  status: string;
  date: string;
  collectorId: string | null;
};

const ITEMS_PER_PAGE = 5;

export default function CollectPage() {
  const [tasks, setTasks] = useState<CollectionTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [hoveredWasteType, setHoveredWasteType] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTask, setSelectedTask] = useState<CollectionTask | null>(null);
  const [verificationImage, setVerificationImage] = useState<string | null>(
    null
  );

  useEffect(() => {
    const storedEmail = localStorage.getItem("user");
    setUserEmail(storedEmail);

    const existing = localStorage.getItem("collectionTasks");
    const reported = localStorage.getItem("reports");

    setTasks((prevTasks) => [...prevTasks, ...JSON.parse(reported as string)]);

    if (!existing) {
      const dummyTasks: CollectionTask[] = [
        {
          id: 1,
          location: "Anna Nagar",
          wasteType: "Plastic Bottles",
          amount: "3kg",
          status: "pending",
          date: "2025-08-01",
          collectorId: null,
        },
        {
          id: 2,
          location: "T. Nagar",
          wasteType: "Food Waste",
          amount: "5kg",
          status: "in_progress",
          date: "2025-08-02",
          collectorId: storedEmail,
        },
        {
          id: 3,
          location: "Velachery",
          wasteType: "E-Waste",
          amount: "2kg",
          status: "verified",
          date: "2025-08-03",
          collectorId: storedEmail,
        },
        {
          id: 4,
          location: "Tambaram",
          wasteType: "Metal Scrap",
          amount: "4kg",
          status: "pending",
          date: "2025-08-04",
          collectorId: null,
        },
        {
          id: 5,
          location: "Kodambakkam",
          wasteType: "Glass",
          amount: "1kg",
          status: "verified",
          date: "2025-08-05",
          collectorId: storedEmail,
        },
      ];

      localStorage.setItem("collectionTasks", JSON.stringify(dummyTasks));
      setTasks((prevTasks) => [...prevTasks, ...dummyTasks]);
      console.log("tasks", tasks);
    } else {
      setTasks(JSON.parse(existing));
    }

    setLoading(false);
  }, []);

  const saveTasks = (updated: CollectionTask[]) => {
    setTasks(updated);
    localStorage.setItem("collectionTasks", JSON.stringify(updated));
  };

  const handleStatusChange = (
    taskId: number,
    newStatus: CollectionTask["status"]
  ) => {
    if (!userEmail) {
      toast.error("User not logged in");
      return;
    }

    const updated = tasks.map(
      (task): CollectionTask =>
        task.id === taskId
          ? {
              ...task,
              status: newStatus,
              collectorId:
                newStatus === "in_progress" ? userEmail : task.collectorId,
            }
          : task
    );
    saveTasks(updated);
    toast.success(`Task marked as ${newStatus}`);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setVerificationImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVerify = () => {
    if (!selectedTask || !userEmail || !verificationImage) {
      toast.error("Missing information for verification.");
      return;
    }

    const updated = tasks.map((task) =>
      task.id === selectedTask.id ? { ...task, status: "verified" } : task
    );
    saveTasks(updated);
    toast.success("Waste verified successfully! Reward added.");
    setSelectedTask(null);
    setVerificationImage(null);
  };

  const filteredTasks = tasks
    .filter((task) =>
      task.location.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const paginated = filteredTasks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  const pageCount = Math.ceil(filteredTasks.length / ITEMS_PER_PAGE);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">
        Waste Collection Tasks
      </h1>

      <div className="mb-4 flex items-center">
        <Input
          type="text"
          placeholder="Search by area..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mr-2"
        />
        <Button variant="outline" size="icon">
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader className="animate-spin h-8 w-8 text-gray-500" />
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {paginated.map((task) => (
              <div
                key={task.id}
                className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
              >
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-medium text-gray-800 flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-gray-500" />
                    {task.location}
                  </h2>
                  <StatusBadge status={task.status} />
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm text-gray-600 mb-3">
                  <div className="flex items-center relative">
                    <Trash2 className="w-4 h-4 mr-2 text-gray-500" />
                    <span
                      onMouseEnter={() => setHoveredWasteType(task.wasteType)}
                      onMouseLeave={() => setHoveredWasteType(null)}
                      className="cursor-pointer"
                    >
                      {task.wasteType.length > 8
                        ? `${task.wasteType.slice(0, 8)}...`
                        : task.wasteType}
                    </span>
                    {hoveredWasteType === task.wasteType && (
                      <div className="absolute left-0 top-full mt-1 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10">
                        {task.wasteType}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center">
                    <Weight className="w-4 h-4 mr-2 text-gray-500" />
                    {task.amount}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                    {task.date}
                  </div>
                </div>
                <div className="flex justify-end">
                  {task.status === "pending" && (
                    <Button
                      onClick={() => handleStatusChange(task.id, "in_progress")}
                      size="sm"
                    >
                      Start Collection
                    </Button>
                  )}
                  {task.status === "in_progress" &&
                    task.collectorId === userEmail && (
                      <Button onClick={() => setSelectedTask(task)} size="sm">
                        Complete & Verify
                      </Button>
                    )}
                  {task.status === "in_progress" &&
                    task.collectorId !== userEmail && (
                      <span className="text-yellow-600 text-sm font-medium">
                        In progress by another user
                      </span>
                    )}
                  {task.status === "verified" && (
                    <span className="text-green-600 text-sm font-medium">
                      Verified
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-center">
            <Button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="mr-2"
            >
              Previous
            </Button>
            <span className="self-center">
              Page {currentPage} of {pageCount}
            </span>
            <Button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, pageCount))}
              disabled={currentPage === pageCount}
              className="ml-2"
            >
              Next
            </Button>
          </div>
        </>
      )}

      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">Verify Collection</h3>
            <p className="mb-4 text-sm text-gray-600">
              Upload an image to complete verification.
            </p>

            <div className="mb-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
              />
              {verificationImage && (
                <img src={verificationImage} className="mt-4 rounded w-full" />
              )}
            </div>

            <Button
              onClick={handleVerify}
              disabled={!verificationImage}
              className="w-full"
            >
              Verify Collection
            </Button>
            <Button
              onClick={() => setSelectedTask(null)}
              variant="outline"
              className="w-full mt-2"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig = {
    pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
    in_progress: { color: "bg-blue-100 text-blue-800", icon: Trash2 },
    verified: { color: "bg-green-100 text-green-800", icon: CheckCircle },
  };

  const { color, icon: Icon } = statusConfig["pending"];

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${color} flex items-center`}
    >
      <Icon className="mr-1 h-3 w-3" />
      {status.replace("_", " ")}
    </span>
  );
}
