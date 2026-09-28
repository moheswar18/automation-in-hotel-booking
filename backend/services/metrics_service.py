from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST

# HTTP Request Metrics
REQUEST_COUNT = Counter(
    'http_requests_total',
    'Total HTTP requests processed by StayEase API',
    ['method', 'endpoint', 'status_code']
)

REQUEST_LATENCY = Histogram(
    'http_request_duration_seconds',
    'HTTP request latency in seconds for StayEase API',
    ['method', 'endpoint']
)

# Business Metrics for Hotel Booking Infrastructure
BOOKINGS_TOTAL = Counter(
    'hotel_bookings_total',
    'Total number of hotel room bookings created',
    ['status']
)

HOTEL_REVENUE = Counter(
    'hotel_revenue_total_inr',
    'Total revenue generated from confirmed bookings in INR'
)

ACTIVE_ROOMS_GAUGE = Gauge(
    'hotel_active_rooms_total',
    'Number of currently available hotel rooms'
)

USERS_TOTAL_GAUGE = Gauge(
    'hotel_registered_users_total',
    'Total number of registered users in the platform'
)

def get_metrics_payload():
    """Generates Prometheus format metric scrape response"""
    return generate_latest(), CONTENT_TYPE_LATEST
