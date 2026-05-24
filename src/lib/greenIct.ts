export const GREEN_ICT_METHODOLOGY_VERSION = "v1-switzerland-eu-default";

export const DEFAULT_FACTORS = {
  electricityChKgPerKwh: 0.03,
  electricityEuCloudKgPerKwh: 0.25,
  dieselKgPerLiter: 2.68,
  petrolKgPerLiter: 2.31,
  naturalGasKgPerKwh: 0.202
} as const;

export function getDefaultFactor(scope: number, sourceType: string): number {
  if (scope === 2) {
    if (sourceType === "electricity_ch") return DEFAULT_FACTORS.electricityChKgPerKwh;
    if (sourceType === "electricity_eu_cloud") return DEFAULT_FACTORS.electricityEuCloudKgPerKwh;
  }

  if (scope === 1) {
    if (sourceType === "diesel_liters") return DEFAULT_FACTORS.dieselKgPerLiter;
    if (sourceType === "petrol_liters") return DEFAULT_FACTORS.petrolKgPerLiter;
    if (sourceType === "natural_gas_kwh") return DEFAULT_FACTORS.naturalGasKgPerKwh;
  }

  return 0;
}

export function getMonthBounds(periodMonth: string) {
  const start = new Date(`${periodMonth}-01T00:00:00.000Z`);
  const next = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1));
  const end = new Date(next.getTime() - 1);
  return {
    startIso: start.toISOString(),
    endIso: end.toISOString(),
    startDate: start,
    endDate: end
  };
}

export function getPreviousMonth(): string {
  const now = new Date();
  const prev = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  const month = `${prev.getUTCMonth() + 1}`.padStart(2, "0");
  return `${prev.getUTCFullYear()}-${month}`;
}

export function estimateDigitalKwh(metrics: {
  checkIns: number;
  gradeRecords: number;
  gradedQuantity: number;
  createdEvents: number;
  activeUsers: number;
}) {
  const baseKwh = 12;
  const checkInKwh = metrics.checkIns * 0.02;
  const gradeRecordKwh = metrics.gradeRecords * 0.005;
  const gradedQuantityKwh = metrics.gradedQuantity * 0.0005;
  const eventKwh = metrics.createdEvents * 0.03;
  const userKwh = metrics.activeUsers * 0.01;

  const totalKwh = baseKwh + checkInKwh + gradeRecordKwh + gradedQuantityKwh + eventKwh + userKwh;
  return {
    totalKwh: Number(totalKwh.toFixed(4)),
    swissOpsKwh: Number((totalKwh * 0.7).toFixed(4)),
    euCloudKwh: Number((totalKwh * 0.3).toFixed(4)),
    components: {
      baseKwh,
      checkInKwh: Number(checkInKwh.toFixed(4)),
      gradeRecordKwh: Number(gradeRecordKwh.toFixed(4)),
      gradedQuantityKwh: Number(gradedQuantityKwh.toFixed(4)),
      eventKwh: Number(eventKwh.toFixed(4)),
      userKwh: Number(userKwh.toFixed(4))
    }
  };
}
