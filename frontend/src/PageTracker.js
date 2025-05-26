// PageTracker.js
import React, { useEffect } from "react";
import Cookies from "js-cookie";
import { useLocation, useNavigate } from "react-router-dom";

function PageTracker() {
  const location = useLocation();
  const navigate = useNavigate();

  // Save current page to cookie on every route change
  useEffect(() => {
    Cookies.set("lastPage", location.pathname, { expires: 7 });
  }, [location]);

  // On first load, go to last visited page
  useEffect(() => {
    const lastPage = Cookies.get("lastPage");
    if (lastPage && lastPage !== location.pathname) {
      navigate(lastPage);
    }
  }, []);

  return null;
}

export default PageTracker;
