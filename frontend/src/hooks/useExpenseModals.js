import { useState, useEffect } from 'react';

export const useExpenseModals = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);

  // 필터 토글 핸들러
  const toggleFilter = () => setIsFilterOpen(!isFilterOpen);

  // 모달 열기 핸들러들
  const openNotificationModal = () => setIsNotificationModalOpen(true);
  const closeNotificationModal = () => setIsNotificationModalOpen(false);

  const openApprovalModal = () => setIsApprovalModalOpen(true);
  const closeApprovalModal = () => setIsApprovalModalOpen(false);

  const openCompanyModal = () => setIsCompanyModalOpen(true);
  const closeCompanyModal = () => setIsCompanyModalOpen(false);

  return {
    modals: {
      isFilterOpen,
      isNotificationModalOpen,
      isApprovalModalOpen,
      isCompanyModalOpen
    },
    handlers: {
      toggleFilter,
      openNotificationModal,
      closeNotificationModal,
      openApprovalModal,
      closeApprovalModal,
      openCompanyModal,
      closeCompanyModal
    }
  };
};
