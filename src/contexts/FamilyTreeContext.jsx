import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';

const FamilyTreeContext = createContext(null);

export const FamilyTreeProvider = ({ children }) => {
  const [currentTreeId, setCurrentTreeId] = useState(null);
  const [currentTreeName, setCurrentTreeName] = useState(null);
  const [role, setRole] = useState(null);
  const [permissions, setPermissions] = useState([]);

  useEffect(() => {
    const treeId = localStorage.getItem('currentFamilyTreeId');
    if (treeId) {
      setCurrentTreeId(treeId);
      setCurrentTreeName(localStorage.getItem('currentFamilyTreeName'));
      setRole(authService.getRole());
      setPermissions(authService.getPermissions());
    }
  }, []);

  const selectTree = async (treeId, treeName) => {
    const data = await authService.selectTree(treeId, treeName);
    setCurrentTreeId(treeId);
    if (treeName) setCurrentTreeName(treeName);
    setRole(data.role);
    setPermissions(data.permissions);
    return data;
  };

  const hasPermission = (permissionCode) => {
    return permissions.includes(permissionCode);
  };

  const clearSelectedTree = () => {
    localStorage.removeItem('currentFamilyTreeId');
    localStorage.removeItem('currentFamilyTreeName');
    localStorage.removeItem('role');
    localStorage.removeItem('permissions');
    setCurrentTreeId(null);
    setCurrentTreeName(null);
    setRole(null);
    setPermissions([]);
  };

  const value = {
    currentTreeId,
    currentTreeName,
    role,
    permissions,
    selectTree,
    hasPermission,
    clearSelectedTree
  };

  return (
    <FamilyTreeContext.Provider value={value}>
      {children}
    </FamilyTreeContext.Provider>
  );
};

export const useFamilyTree = () => useContext(FamilyTreeContext);