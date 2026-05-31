import * as React from 'react'
import en from './en'
import ja from './ja'

export type Language = 'en' | 'ja'

export type Translations = {
  common: {
    appName: string
    tagline: string
    dashboard: string
    logOut: string
    uploadExpense: string
    email: string
    password: string
    submit: string
    month: string
    status: string
    category: string
    action: string
    allStatuses: string
    allCategories: string
    viewDetails: string
    backToDashboard: string
    noExpenses: string
    months: string[]
    statusLabels: {
      submitted: string
      pending: string
      verified: string
      rejected: string
      paid: string
      done: string
    }
  }
  login: {
    welcome: string
    subtitle: string
  }
  userDashboard: {
    title: string
    subtitle: string
    newExpense: string
    totalReviewedSubmitted: string
    totalReview: string
    categoryBreakdown: string
    noData: string
    rejectReason: string
    colDate: string
    colTitle: string
    colAmount: string
    dateFrom: string
    dateTo: string
    prevPage: string
    nextPage: string
    pageInfo: string
  }
  adminDashboard: {
    title: string
    subtitle: string
    employeeOverview: string
    colEmployee: string
    colTotalSubmitted: string
    colTotalReimbursed: string
    colActionStatus: string
    noSubmissions: string
    dateFrom: string
    dateTo: string
    prevPage: string
    nextPage: string
    pageInfo: string
    categoryLimits: string
    colCategory: string
    colMonthlyLimit: string
    noLimit: string
  }
  adminReview: {
    backToEmployeeDetails: string
    title: string
    submittedBy: string
    totalSubmitted: string
    totalApproved: string
    receiptPreview: string
    nativeAmount: string
    titleOfReceipt: string
    billCount: string
    billCountSingle: string
    updateStatus: string
    rejectRequiresReason: string
    markAsReviewed: string
    reviewed: string
    markAsReimbursed: string
    noReceipt: string
    reviewedSuccess: string
    reimbursedSuccess: string
    noExpenses: string
    reject: string
    rejected: string
    rejectSuccess: string
    reimbursed: string
    reasonForRejection: string
    reasonForRejectionPlaceholder: string
    reasonRequired: string
    clickToExpand: string
  }
  adminUserDetail: {
    totalSubmitted: string
    totalApproved: string
    markAsReimbursed: string
    expenses: string
    colLatestDate: string
    colNoOfBills: string
    colSubmittedAmount: string
    colApprovedAmount: string
    review: string
    reimbursedSuccess: string
    prevPage: string
    nextPage: string
    pageInfo: string
  }
  uploadExpense: {
    subtitle: string
    formTitle: string
    currency: string
    dragAndDrop: string
    orClickToBrowse: string
    browseFiles: string
    uploadedFiles: string
    successMessage: string
    errFilesRequired: string
    errFilesMax: string
    errImageOnly: string
    removeFile: string
    uploadSuccessTitle: string
    uploadSuccessBody: string
    errorTitle: string
    errorBody: string
  }
  billDetail: {
    receiptPreview: string
    expenseDetails: string
    amount: string
    approvedAmount: string
    date: string
    category: string
    title: string
    billNumber: string
    vatNumber: string
    vendor: string
    phone: string
    statusTimeline: string
    stepSubmitted: string
    stepUnderReview: string
    stepReviewed: string
    stepReimbursed: string
    viewReceipt: string
    noReceipt: string
    loadingError: string
  }
  reviewBatch: {
    title: string
    subtitle: string
    processingTitle: string
    processingSubtitle: string
    stepUploaded: string
    stepScanning: string
    stepReview: string
    validBills: string
    invalidBills: string
    extractedData: string
    amount: string
    billNo: string
    vatNo: string
    validationError: string
    totalAmount: string
    submitForReimbursement: string
    submitSuccess: string
    monthNote: string
    noValidBills: string
    editBill: string
    saveBill: string
    cancelEdit: string
    removeBill: string
    fixBill: string
    updateSuccess: string
    updateError: string
    removeSuccess: string
    removeError: string
    confirmRemove: string
    loadingBills: string
    almostDone: string
    updateSuccessTitle: string
    updateSuccessBody: string
    removeSuccessTitle: string
    removeSuccessBody: string
    submitSuccessTitle: string
    submitSuccessBody: string
    errorTitle: string
    errorBody: string
  }
  submitSuccess: {
    heading: string
    subtitle: string
    detailsTitle: string
    labelTitle: string
    labelDate: string
    labelCategory: string
    labelAmount: string
    submitAnother: string
    backToDashboard: string
  }
  notFound: {
    title: string
    description: string
    errorCode: string
  }
  adminCategories: {
    title: string
    subtitle: string
    newCategory: string
    colName: string
    colJPName: string
    colMonthlyLimit: string
    colStatus: string
    colActions: string
    active: string
    inactive: string
    noLimit: string
    noCategories: string
    editCategory: string
    deleteCategory: string
    confirmDelete: string
    saveChanges: string
    cancel: string
    placeholderName: string
    placeholderLimit: string
    createSuccess: string
    updateSuccess: string
    deleteSuccess: string
  }
  auth: {
    sessionExpired: string
  }
}

const STORAGE_KEY = 'lang'

const translations: Record<Language, Translations> = { en, ja }

// Module-level singleton — readable outside React (e.g. axios interceptor)
let _currentLang: Language = 'en'

export function getT(): Translations {
  return translations[_currentLang]
}

// ─── Context ────────────────────────────────────────────────────────────────

type I18nContextValue = {
  lang: Language
  setLang: (lang: Language) => void
  t: Translations
}

const I18nContext = React.createContext<I18nContextValue | null>(null)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = React.useState<Language>('en')

  // Hydrate from localStorage once on mount (client only)
  React.useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'ja' || stored === 'en') {
      _currentLang = stored
      setLangState(stored)
    }
  }, [])

  const setLang = React.useCallback((next: Language) => {
    _currentLang = next
    localStorage.setItem(STORAGE_KEY, next)
    setLangState(next)
  }, [])

  const value = React.useMemo(
    () => ({ lang, setLang, t: translations[lang] }),
    [lang, setLang],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nContextValue {
  const ctx = React.useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider')
  return ctx
}
