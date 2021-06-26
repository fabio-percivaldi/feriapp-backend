'use strict'

module.exports = {
    body: {
        type: 'object',
        properties: {
            dayOfHolidays: {
                type: "number",
                description: "Number of days of holidays to consume for the bridge"
            },
            customHolidays: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        date: {
                            type: "string",
                            description: "Date of the custom holidays in format YYYY-MM-DD"
                        },
                        name: {
                            type: "string"
                        }
                    }
                }
            },
            city: {
                type: "string"
            },
            daysOff: {
                type: "array",
                items: {
                    type: "number",
                    description: "Array of not working days",
                    example: 0
                }
            }
        }
    },
    response: {
        200: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    years: {
                        type: "array",
                        items: {
                            type: "string",
                            description: "The years interested by bridges"
                        }
                    },
                    bridges: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                start: {
                                    type: "string",
                                    description: "Starting day of bridge in format YYYY-MM-DDTHH:MM:SS.sssZ",
                                    example: "2020-05-21T20:34:55.097Z"
                                },
                                end: {
                                    type: "string",
                                    description: "Ending day of bridge in format YYYY-MM-DDTHH:MM:SS.sssZ",
                                    example: "2020-05-24T20: 34: 55.097Z"
                                },
                                holidaysCount: {
                                    type: "number",
                                    description: "Number of holiday days for the bridge"
                                },
                                weekdaysCount: {
                                    type: "number",
                                    description: "Number of weekdays for the bridge"
                                },
                                daysCount: {
                                    type: "number",
                                    description: "Total number of days for the bridge"
                                },
                                rate: {
                                    type: "string",
                                    description: "A custom rating for the bridge"
                                },
                                id: {
                                    type: "string",
                                    description: "Id of the bridge, concatenation of start date and end date",
                                    example: "2020-05-21-2020-05-24"
                                },
                                isTop: {
                                    type: "boolean",
                                    description: "If bridge is in the \"top\" category"
                                }
                            }
                        }
                    },
                    holidaysCount: {
                        type: "number",
                        description: "Sum of the number of holiday days for the specif year for the bridges in results"
                    },
                    weekdaysCount: {
                        type: "number",
                        description: "Sum of the number of weekdays for the specif year for the bridges in results"
                    },
                    daysCount: {
                        type: "number",
                        description: "Sum of the total days for the specif year for the bridges in results"
                    }
                }
            }
        },
        500: {
            type: 'object',
            properties: {
                errorMessage: {
                    type: 'string'
                }
            }
        }
    }
}