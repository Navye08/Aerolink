import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  Globe,
  Smartphone,
  Compass,
  Laptop,
  ArrowUpRight,
  Activity,
  Layers,
} from "lucide-react";

const DEVICE_COLORS = {
  Desktop: "#3B82F6", // electric blue
  Mobile: "#10B981",  // emerald
  Tablet: "#F59E0B",  // amber
};

const PALETTE = ["#3B82F6", "#06B6D4", "#8B5CF6", "#10B981", "#F59E0B", "#EC4899"];

// Custom Dark Tooltip
const CustomChartTooltip = ({active, payload, label}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface-elevated border border-border-strong rounded-lg p-2.5 shadow-xl text-xs space-y-1">
        <p className="font-semibold text-foreground">{label}</p>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-muted-foreground">Clicks:</span>
          <span className="font-mono font-bold text-foreground tabular-nums">
            {payload[0].value.toLocaleString()}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export function ClickTrendChart({timeSeries = []}) {
  if (!timeSeries || timeSeries.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-muted-foreground text-xs border border-dashed border-border-subtle rounded-xl bg-surface/30">
        <Activity className="h-6 w-6 text-muted-foreground/40 mb-2" />
        <span>No click activity recorded in this time range.</span>
      </div>
    );
  }

  return (
    <div className="h-64 w-full pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={timeSeries}
          margin={{top: 10, right: 10, left: -20, bottom: 0}}
        >
          <defs>
            <linearGradient id="clicksGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#1e2638" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            stroke="#64748B"
            fontSize={11}
            tickLine={false}
            axisLine={{stroke: "#1e2638"}}
            fontFamily="monospace"
          />
          <YAxis
            stroke="#64748B"
            fontSize={11}
            tickLine={false}
            axisLine={{stroke: "#1e2638"}}
            allowDecimals={false}
            fontFamily="monospace"
          />
          <Tooltip content={<CustomChartTooltip />} />
          <Area
            type="monotone"
            dataKey="clicks"
            stroke="#3B82F6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#clicksGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DeviceDonutChart({devices = []}) {
  if (!devices || devices.length === 0) {
    return (
      <div className="h-52 flex flex-col items-center justify-center text-muted-foreground text-xs border border-dashed border-border-subtle rounded-xl bg-surface/30">
        <Smartphone className="h-5 w-5 text-muted-foreground/40 mb-1.5" />
        <span>No device telemetry yet</span>
      </div>
    );
  }

  const total = devices.reduce((sum, d) => sum + (d.value || 0), 0);

  return (
    <div className="h-52 w-full flex flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height={140}>
        <PieChart>
          <Pie
            data={devices}
            innerRadius={42}
            outerRadius={62}
            paddingAngle={3}
            dataKey="value"
          >
            {devices.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={DEVICE_COLORS[entry.name] || PALETTE[index % PALETTE.length]}
                stroke="#111620"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#161c28",
              borderColor: "#2b364e",
              borderRadius: "8px",
              color: "#f8fafc",
              fontSize: "12px",
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Compact Legend with Percentages */}
      <div className="flex flex-wrap justify-center gap-3 mt-1">
        {devices.map((d, i) => {
          const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
          return (
            <div key={i} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor:
                    DEVICE_COLORS[d.name] || PALETTE[i % PALETTE.length],
                }}
              />
              <span className="text-foreground font-medium">{d.name}</span>
              <span className="font-mono text-[10px] text-muted-foreground">({pct}%)</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function HorizontalBarList({title, icon: Icon, items = [], labelKey, valueKey}) {
  if (!items || items.length === 0) {
    return (
      <div className="p-4 bg-surface border border-border-subtle rounded-xl space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
          {Icon && <Icon className="h-3.5 w-3.5 text-primary" />}
          <span>{title}</span>
        </div>
        <div className="text-[11px] text-muted-foreground py-6 text-center">
          No data recorded
        </div>
      </div>
    );
  }

  const maxVal = Math.max(...items.map((it) => it[valueKey] || 1), 1);

  return (
    <div className="p-4 bg-surface border border-border-subtle rounded-xl space-y-3">
      <div className="flex items-center justify-between text-xs font-semibold text-foreground">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-3.5 w-3.5 text-primary" />}
          <span>{title}</span>
        </div>
        <span className="text-[10px] text-muted-foreground font-mono font-normal">Count</span>
      </div>

      <div className="space-y-2">
        {items.map((item, idx) => {
          const percentage = Math.round(((item[valueKey] || 0) / maxVal) * 100);
          return (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-foreground/90 truncate max-w-[170px] text-[11px]">
                  {item[labelKey] || "Unknown"}
                </span>
                <span className="font-mono text-muted-foreground text-[11px] tabular-nums">
                  {item[valueKey]}
                </span>
              </div>
              <div className="h-1.5 w-full bg-surface-elevated rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{width: `${percentage}%`}}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function RecentActivityStream({recentClicks = []}) {
  if (!recentClicks || recentClicks.length === 0) {
    return (
      <div className="text-center py-8 text-xs text-muted-foreground">
        No recent click activity recorded.
      </div>
    );
  }

  return (
    <div className="divide-y divide-border-subtle">
      {recentClicks.map((click, idx) => (
        <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-7 h-7 rounded-lg bg-surface-elevated border border-border-subtle flex items-center justify-center text-muted-foreground flex-shrink-0">
              {click.device === "mobile" ? (
                <Smartphone className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Laptop className="h-3.5 w-3.5 text-primary" />
              )}
            </span>
            <div className="min-w-0">
              <div className="text-foreground font-medium text-xs truncate">
                {click.city && click.city !== "Unknown" ? `${click.city}, ` : ""}
                {click.country || "Direct visitor"}
              </div>
              <div className="text-[10px] text-muted-foreground truncate">
                {click.browser || "Browser"} • {click.os || "OS"} • via {click.referrer || "Direct"}
              </div>
            </div>
          </div>
          <span className="text-muted-foreground text-[10px] font-mono flex-shrink-0 pl-2">
            {new Date(click.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      ))}
    </div>
  );
}

export function AnalyticsDashboardView({analyticsData}) {
  const {
    timeSeries,
    devices,
    browsers,
    operatingSystems,
    topCountries,
    topCities,
    topReferrers,
    recentClicks,
  } = analyticsData;

  return (
    <div className="space-y-5">
      {/* 1. Click Velocity Over Time */}
      <div className="p-5 bg-surface border border-border-subtle rounded-xl space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-foreground">
                Click Velocity Over Time
              </h4>
              <p className="text-[11px] text-muted-foreground">
                Timeseries volume across selected date range
              </p>
            </div>
          </div>
        </div>
        <ClickTrendChart timeSeries={timeSeries} />
      </div>

      {/* 2. Device, Browser, OS, Referrers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Device Breakdown */}
        <div className="p-4 bg-surface border border-border-subtle rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <Smartphone className="h-3.5 w-3.5 text-primary" />
            <span>Device Categories</span>
          </div>
          <DeviceDonutChart devices={devices} />
        </div>

        {/* Top Browsers */}
        <HorizontalBarList
          title="Top Browsers"
          icon={Compass}
          items={browsers}
          labelKey="name"
          valueKey="count"
        />

        {/* Operating Systems */}
        <HorizontalBarList
          title="Operating Systems"
          icon={Laptop}
          items={operatingSystems}
          labelKey="name"
          valueKey="count"
        />

        {/* Referrers */}
        <HorizontalBarList
          title="Top Referrers"
          icon={ArrowUpRight}
          items={topReferrers}
          labelKey="source"
          valueKey="count"
        />
      </div>

      {/* 3. Geographic Intelligence & Live Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <HorizontalBarList
          title="Top Countries"
          icon={Globe}
          items={topCountries}
          labelKey="country"
          valueKey="count"
        />

        <HorizontalBarList
          title="Top Cities"
          icon={Globe}
          items={topCities}
          labelKey="city"
          valueKey="count"
        />

        {/* Live Click Stream */}
        <div className="p-4 bg-surface border border-border-subtle rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <Layers className="h-3.5 w-3.5 text-emerald-400" />
            <span>Recent Click Stream</span>
          </div>
          <RecentActivityStream recentClicks={recentClicks} />
        </div>
      </div>
    </div>
  );
}
