export type VehicleDocumentType = "drivers_license" | "vehicle_registration" | "insurance"

export interface VehicleFields {
    document_type: VehicleDocumentType
    document_number: string
    holder_name: string
    plate: string | null
    due_date: string //ISO 8601
    amount: number | null
}

export type HealthDocumentType = "exam_result" | "prescription" | "vaccination_record"

export interface HealthFields {
    document_type: HealthDocumentType
    patient_name: string
    issuer_name: string
    document_date: string // ISO 8601
    due_date: string // ISO 8601
    descriptin: string
}

export type BillsDocumentType = "utility_water" | "utility_electricity" | "utility_gas" | "condo_fee" | "internet" | "credit_card_invoice"

export interface BillsFields {
    document_type: BillsDocumentType
    biller_name: string
    amount: number
    due_date: string // ISO 8601
    reference_period: string
    document_number: string | null
}

export type DocumentCategory = "vehicle" | "health" | "bills"