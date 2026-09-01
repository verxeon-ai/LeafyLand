export const SERVICE_ART = {
    'Garden Design': '/icons/services/garden-design.png',
    'Drip Irrigation Setup': '/icons/services/irrigation.png',
    'Irrigation Repair': '/icons/services/irrigation.png',
    'Plant Watering': '/icons/services/irrigation.png',
    'Monthly Garden Maintenance': '/icons/services/maintenance.png',
    'Lawn Mowing': '/icons/services/maintenance.png',
    'Garden Cleaning': '/icons/services/maintenance.png',
    'Indoor Plant Care': '/icons/services/plant.png',
    'Plant Replacement': '/icons/services/plant.png',
    'Balcony Setup': '/icons/services/garden-design.png',
    'Soil Replacement': '/icons/services/plant.png',
}

const CATEGORY_ART = {
    Landscaping: '/icons/services/garden-design.png',
    Irrigation: '/icons/services/irrigation.png',
    'Garden Maintenance': '/icons/services/maintenance.png',
    'Daily Needs Services': '/icons/services/plant.png',
}

const DEFAULT_ART = '/icons/services/plant.png'

export function artForService(service) {
    return SERVICE_ART[service?.name] || CATEGORY_ART[service?.category] || DEFAULT_ART
}
