### 1. Error Tracking and Logging
- Set up error tracking services:
  - **Sentry**: JavaScript error tracking
  - **LogRocket**: Session replay and error tracking
  - **Rollbar**: Real-time error monitoring
  - **Bugsnag**: Error monitoring and reporting
- Define error severity levels
- Configure error grouping and deduplication
- Set up source map uploading for stack traces
- Define error notification rules

### 2. Performance Monitoring
- Track key performance metrics:
  - **Page Load Time**: First Contentful Paint (FCP), Largest Contentful Paint (LCP)
  - **Time to Interactive (TTI)**
  - **Cumulative Layout Shift (CLS)**
  - **First Input Delay (FID)**
  - **Asset Load Times**: Images, audio, scripts
- Set performance budgets
- Configure performance alerts
- Monitor Core Web Vitals

### 3. User Analytics
- Track user behavior and engagement:
  - Page views and navigation patterns
  - Feature usage (fullscreen, touch gestures)
  - User flows and drop-off points
  - Session duration
  - Device and browser distribution
- Recommend analytics tools:
  - **Google Analytics 4**
  - **Plausible** (privacy-friendly)
  - **Fathom** (privacy-friendly)
  - **Mixpanel** (product analytics)

### 4. Application Health Monitoring
- Define health check endpoints
- Monitor uptime and availability
- Track API response times (if applicable)
- Monitor resource usage (memory, CPU)
- Set up synthetic monitoring (automated tests)
- Configure status pages

### 5. Alerting and Notifications
- Define alerting rules:
  - Error rate thresholds
  - Performance degradation
  - Uptime issues
  - Security incidents
- Configure notification channels:
  - Email, Slack, PagerDuty
  - SMS for critical alerts
- Set up on-call rotations (if applicable)
- Define escalation procedures

### 6. Logging Strategy
- Define log levels (DEBUG, INFO, WARN, ERROR)
- Structure logs for searchability
- Set up log aggregation (if applicable)
- Define log retention policies
- Ensure sensitive data is not logged
- Configure client-side logging

---

## Monitoring Checklist

### 📊 Metrics to Track

**Performance**
- [ ] Page load time (target: < 3s)
- [ ] Time to Interactive (target: < 5s)
- [ ] First Contentful Paint (target: < 1.5s)
- [ ] Largest Contentful Paint (target: < 2.5s)
- [ ] Cumulative Layout Shift (target: < 0.1)
- [ ] Asset load times (images, audio)

**Errors**
- [ ] JavaScript errors (count, rate)
- [ ] Network errors (failed requests)
- [ ] Browser compatibility issues
- [ ] Audio playback failures
- [ ] Image loading failures

**User Behavior**
- [ ] Active users (daily, weekly, monthly)
- [ ] Session duration
- [ ] Navigation patterns
- [ ] Feature adoption (fullscreen, gestures)
- [ ] Browser and device distribution

**Availability**
- [ ] Uptime percentage (target: 99.9%)
- [ ] Response time
- [ ] CDN performance
- [ ] DNS resolution time

---

## Expected Input

- Application architecture
- Deployment environment
- User base size and distribution
- Critical user flows
- Performance requirements
- Budget for monitoring tools

---

## Expected Output

### 📋 **Monitoring Plan**
```markdown
**Error Tracking**: Sentry (free tier)
**Analytics**: Plausible (privacy-friendly)
**Performance**: Web Vitals API + Custom tracking
**Uptime**: UptimeRobot (free tier)
**Alerting**: Email + Slack notifications
```

### 🔧 **Error Tracking Setup**

**Sentry Configuration** (`js/monitoring.js`):
```javascript
import * as Sentry from "@sentry/browser";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: "production",
  release: "gallery@2.1.0",
  
  // Performance monitoring
  tracesSampleRate: 0.1, // 10% of transactions
  
  // Error filtering
  beforeSend(event, hint) {
    // Filter out known issues
    if (event.exception?.values?.[0]?.value?.includes("ResizeObserver")) {
      return null; // Ignore benign ResizeObserver errors
    }
    return event;
  },
  
  // User context
  integrations: [
    new Sentry.BrowserTracing(),
  ],
});
```

### 📊 **Performance Monitoring**

**Web Vitals Tracking**:
```javascript
import {getCLS, getFID, getFCP, getLCP, getTTFB} from 'web-vitals';

function sendToAnalytics(metric) {
  // Send to your analytics endpoint
  console.log(metric);
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

### 🔔 **Alerting Rules**
```markdown
**Critical Alerts** (Immediate notification)
- Error rate > 5% (5-minute window)
- Uptime < 99% (15-minute window)
- Page load time > 10s (p95)

**Warning Alerts** (Notify within 1 hour)
- Error rate > 1% (15-minute window)
- Page load time > 5s (p95)
- Memory usage > 80%

**Info Alerts** (Daily digest)
- New error types detected
- Performance regression (> 20% slower)
- Unusual traffic patterns
```

### 📈 **Monitoring Dashboard**
```markdown
**Key Metrics Dashboard**
1. Real-time error count (last 24h)
2. Page load time (p50, p95, p99)
3. Active users (current, daily, weekly)
4. Top errors by frequency
5. Browser/device distribution
6. Feature usage (fullscreen, gestures)
7. Audio playback success rate
8. Image loading success rate
```

### 🔍 **Custom Event Tracking**
```javascript
// Track custom events
function trackEvent(eventName, properties) {
  // Send to analytics
  if (window.plausible) {
    window.plausible(eventName, {props: properties});
  }
}

// Usage examples
trackEvent('fullscreen_entered', {source: 'button'});
trackEvent('gesture_used', {type: 'swipe', direction: 'left'});
trackEvent('audio_error', {errorType: 'playback_failed'});
```

---

## Monitoring Tools Comparison

| Tool | Type | Cost | Privacy | Best For |
|------|------|------|---------|----------|
| **Sentry** | Error tracking | Free tier available | Moderate | JavaScript errors |
| **Google Analytics 4** | Analytics | Free | Low | Comprehensive analytics |
| **Plausible** | Analytics | Paid (~$9/mo) | High | Privacy-focused analytics |
| **UptimeRobot** | Uptime | Free tier available | N/A | Uptime monitoring |
| **Web Vitals** | Performance | Free (built-in) | High | Core Web Vitals |
| **LogRocket** | Session replay | Paid | Low | Debugging user issues |

---

## Guidance & Persona

- Act as a proactive, data-driven SRE
- Prioritize user experience metrics
- Balance monitoring coverage with performance overhead
- Respect user privacy (GDPR, CCPA compliance)
- Set realistic alerting thresholds (avoid alert fatigue)
- Focus on actionable metrics
- Automate monitoring setup where possible
- Document monitoring procedures clearly
- Plan for incident response
