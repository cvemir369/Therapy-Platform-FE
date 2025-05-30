import React, { useContext, useState, useEffect } from "react";
import { axiosClient } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { AdviceContext } from "../../context/AdviceContext";
import { useFavoritesShow } from "../../context/FavoritesShowContext";
import DOMPurify from "dompurify";
import { Link } from "react-router-dom";
import { MessagesSquare, Star, UserRoundPen } from "lucide-react";

const UserDashboard = () => {
  const { user } = useAuth();
  const [diagnosis, setDiagnosis] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const { advice } = useContext(AdviceContext);
  const [displayedAdvice, setDisplayedAdvice] = useState("");
  const { setShowFavoritesOnly, showFavoritesOnly } = useFavoritesShow();

  useEffect(() => {
    const fetchDiagnosis = async () => {
      try {
        const res = await axiosClient.get(`/diagnosis/${user._id}`, {
          withCredentials: true,
        });

        // Check if the response contains an error message
        if (res.data.error === "Diagnosis not found") {
          console.log("No diagnosis found");
          setDiagnosis(null); // Clear any previous diagnosis data
        } else {
          setDiagnosis(res.data); // Set the diagnosis data
        }
      } catch (error) {
        console.log("Error fetching diagnosis:", error);
        setDiagnosis(null); // Clear any previous diagnosis data
      } finally {
        setIsLoading(false); // Set loading to false after the request completes
      }
    };

    if (user._id) {
      fetchDiagnosis();
    } else {
      console.log("User ID is not available");
      setIsLoading(false); // Set loading to false if user._id is not available
    }
  }, [user._id]);

  useEffect(() => {
    if (advice) {
      const cleanAdvice = advice?.trim(); // Clean up the advice
      const sanitizedAdvice = DOMPurify.sanitize(cleanAdvice); // Sanitize the HTML
      setDisplayedAdvice(sanitizedAdvice); // Set the sanitized HTML
    }
  }, [advice]);

  const renderList = (items) => {
    return items && items.length > 0 ? items.join(", ") : "-";
  };

  const extractConclusion = (advice) => {
    if (!advice) return "No conclusion available.";
    const conclusionStart = advice.indexOf("Conclusion:");
    if (conclusionStart !== -1) {
      return advice.substring(conclusionStart + "Conclusion:".length).trim();
    }
    return "No conclusion available.";
  };

  const conclusion = extractConclusion(displayedAdvice);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-6 py-12 mt-24">
      <h1 className="text-3xl font-bold mb-8">{user.name}'s Dashboard</h1>
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full mb-8">
        <button className="w-full px-4 py-2 text-lg font-semibold rounded-full bg-neutral-900 dark:bg-gray-200 text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-300 transition duration-200">
          <Link
            to={"/profile"}
            className="flex items-center justify-center gap-3"
          >
            <UserRoundPen size={24} /> Profile
          </Link>
        </button>
        <button className="w-full px-4 py-2 text-lg font-semibold rounded-full bg-neutral-900 dark:bg-gray-200 text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-300 transition duration-200">
          <Link
            to={"/messages"}
            className="flex items-center justify-center gap-3"
          >
            <MessagesSquare size={24} /> Messages
          </Link>
        </button>
        <Link
          to="/find-therapist"
          state={{ showFavoritesOnly: true }}
          className="w-full px-4 py-2 text-lg font-semibold rounded-full bg-neutral-900 dark:bg-gray-200 text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-300 transition duration-200"
        >
          <div className="flex items-center justify-center gap-3">
            <Star size={24} /> Therapists
          </div>
        </Link>
      </div>
      <div className="space-y-8">
        {/* Initial Diagnosis Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">Initial Diagnosis</h2>
          {diagnosis?.initialDiagnosis ? (
            <>
              <p>
                <strong>Diagnosis:</strong>{" "}
                {renderList(diagnosis.initialDiagnosis.diagnosis)}
              </p>
              <p>
                <strong>Emotions:</strong>{" "}
                {renderList(diagnosis.initialDiagnosis.emotions)}
              </p>
              <p>
                <strong>Therapist Specialties:</strong>{" "}
                {renderList(diagnosis.initialDiagnosis.therapist_specialties)}
              </p>
            </>
          ) : (
            <p>No initial diagnosis found.</p>
          )}
        </div>

        {/* Journal Analysis Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">Journal Analysis</h2>
          {diagnosis?.journalAnalysis ? (
            <>
              <p>
                <strong>Diagnosis:</strong>{" "}
                {renderList(diagnosis.journalAnalysis.diagnosis)}
              </p>
              <p>
                <strong>Emotions:</strong>{" "}
                {renderList(diagnosis.journalAnalysis.emotions)}
              </p>
              <p>
                <strong>Therapist Specialties:</strong>{" "}
                {renderList(diagnosis.journalAnalysis.therapist_specialties)}
              </p>
            </>
          ) : (
            <p>No journal analysis found.</p>
          )}
        </div>

        {/* Advice Conclusion Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">Advice Conclusion</h2>
          {conclusion ? (
            <div dangerouslySetInnerHTML={{ __html: conclusion }} />
          ) : (
            <p>No advice conclusion found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
