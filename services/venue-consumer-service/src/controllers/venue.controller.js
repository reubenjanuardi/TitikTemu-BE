/**
 * Venue Controller
 * Handles venue-related HTTP requests
 * Proxies to LOGe GraphQL API
 */

const venueService = require('../services/venue.service');

/**
 * Get all venues from LOGe
 * @route GET /venues
 */
const getAllVenues = async (req, res, next) => {
  try {
    const venues = await venueService.getAllVenues();

    return res.status(200).json({
      success: true,
      message: 'Venues retrieved successfully',
      data: venues,
      source: 'LOGe'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get venue by ID from LOGe
 * @route GET /venues/:id
 */
const getVenueById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const venue = await venueService.getVenueById(id);

    if (!venue) {
      return res.status(404).json({
        success: false,
        message: 'Venue not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Venue retrieved successfully',
      data: venue,
      source: 'LOGe'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Check venue availability for a specific date
 * @route GET /venues/:id/availability
 */
const checkVenueAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date query parameter is required'
      });
    }

    const availability = await venueService.checkVenueAvailability(id, date);

    return res.status(200).json({
      success: true,
      message: 'Availability retrieved successfully',
      data: availability,
      source: 'LOGe'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all logistics options from LOGe
 * @route GET /venues/logistics
 */
const getLogistics = async (req, res, next) => {
  try {
    const logistics = await venueService.getLogistics();

    return res.status(200).json({
      success: true,
      message: 'Logistics retrieved successfully',
      data: logistics,
      source: 'LOGe'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get logistics by category from LOGe
 * @route GET /venues/logistics/:category
 */
const getLogisticsByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const logistics = await venueService.getLogisticsByCategory(category);

    return res.status(200).json({
      success: true,
      message: 'Logistics retrieved successfully',
      data: logistics,
      source: 'LOGe'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllVenues,
  getVenueById,
  checkVenueAvailability,
  getLogistics,
  getLogisticsByCategory
};
