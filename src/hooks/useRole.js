import React, { useEffect, useState } from "react";
import useAuth from "./useAuth";
import  useAxiosSecure  from "./useAxiosSecure";

const useRole = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const [role, setRole] = useState(null);
  const [roleLoading, setRoleLoading] = useState(true);
  useEffect(() => {
    const fetchUserRole = async () => {
      const { data } = await axiosSecure(
        `${import.meta.env.VITE_API_URL}/user/role/${user?.email}`
      );
      setRole(data?.role);
      setRoleLoading(false);
    };
    fetchUserRole();
  }, [user, axiosSecure]);
  console.log(role);
  return [role, roleLoading];
};

export default useRole;
