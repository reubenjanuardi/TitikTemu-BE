const axios = require("axios");

const VENUE_SERVICE_URL = process.env.VENUE_SERVICE_URL || "http://localhost:3004";

/**
 * Check if venue and room exist
 * @param {string} venueId - Venue ID
 * @param {string} roomId - Room ID
 * @returns {Object} - Venue and room data
 * @throws {Error} - If venue or room not found
 */
async function validateVenueAndRoom(venueId, roomId) {
  const venueResponse = await axios.get(`${VENUE_SERVICE_URL}/venues/${venueId}`);
  const venueData = venueResponse.data?.data;
  if (!venueData) {
    throw new Error(`Venue with ID ${venueId} not found`);
  }

  const roomsResponse = await axios.get(`${VENUE_SERVICE_URL}/venues/${venueId}/rooms`);
  const room = roomsResponse.data?.data?.find((r) => String(r.id) === String(roomId));
  if (!room) {
    throw new Error(`Room with ID ${roomId} not found in venue`);
  }

  return { venue: venueData, room };
}

/**
 * Check room availability for specific time
 * @param {string} roomId - Room ID
 * @param {string} startTime - Start datetime (ISO 8601)
 * @param {string} endTime - End datetime (ISO 8601)
 * @returns {Object} - Availability result
 * @throws {Error} - If room is not available
 */
async function checkRoomAvailability(roomId, startTime, endTime) {
  const response = await axios.post(`${VENUE_SERVICE_URL}/venues/rooms/${roomId}/check-availability`, {
    startTime,
    endTime,
  });
  const availability = response.data?.data;
  if (!availability?.available) {
    throw new Error("Room is already booked for the selected time");
  }
  return availability;
}

/**
 * Create venue booking
 * @param {Object} bookingData - { roomId, startTime, endTime, eventId }
 * @param {Object} user - User object { id, email, role, name }
 * @returns {Object} - Created booking
 * @throws {Error} - If booking fails
 */
async function createVenueBooking(bookingData, user) {
  const response = await axios.post(
    `${VENUE_SERVICE_URL}/venues/bookings`,
    {
      ...bookingData,
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      userName: user.name,
    },
    {
      headers: {
        "x-user-id": user.id,
        "x-user-email": user.email,
        "x-user-role": user.role,
        "x-user-name": user.name,
      },
    }
  );
  const reservation = response.data?.data;
  if (!reservation) {
    throw new Error("Failed to create venue booking");
  }
  return reservation;
}

/**
 * Cancel venue booking
 * @param {string} bookingId - Booking ID
 * @param {Object} user - User object
 * @returns {boolean} - Success status
 */
async function cancelVenueBooking(bookingId, user) {
  await axios.delete(`${VENUE_SERVICE_URL}/venues/bookings/${bookingId}`, {
    headers: {
      "x-user-id": user.id,
      "x-user-email": user.email,
      "x-user-role": user.role,
      "x-user-name": user.name,
    },
  });
  return true;
}

module.exports = {
  validateVenueAndRoom,
  checkRoomAvailability,
  createVenueBooking,
  cancelVenueBooking,
};
