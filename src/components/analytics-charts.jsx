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
} from "recharts";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {
  Globe2,
  Smartphone,
  Compass,
  Laptop,
  ArrowUpRight,
  Activity,
} from "lucide-react";

const DEVICE_COLORS = {
  Desktop: "#3B82F6", // blue-500
  Mobile: "#10B981",  // emerald-500
  Tablet: "#F59E0B",  // amber-500
};

const FALLBACK_COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899"];

export function ClickTrendChart({timeSeries = []}) {
  if (!timeSeries || timeSeries.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500 text-sm">
        No click activity recorded in this time range.
      </div>
    );
  }

  return (
    <div className="h-72 w-full pt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={timeSeries} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
          <defs>
            <linearGradient id="clicksGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            stroke="#64748B"
            fontSize={12}
            tickLine={false}
            axisLine={{stroke: "#334155"}}
          />
          <YAxis
            stroke="#64748B"
            fontSize={12}
            tickLine={false}
            axisLine={{stroke: "#334155"}}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0F172A",
              borderColor: "#334155",
              borderRadius: "8px",
              color: "#F8FAFC",
              fontSize: "12px",
            }}
          />
          <Area
            type="monotone"
            dataKey="clicks"
            stroke="#3B82F6"
            strokeWidth={2.5}
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
      <div className="h-56 flex items-center justify-center text-gray-500 text-sm">
        No device data recorded.
      </div>
    );
  }

  return (
    <div className="h-56 w-full flex flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie
            data={devices}
            innerRadius={45}
            outerRadius={70}
            paddingAngle={4}
            dataKey="value"
          >
            {devices.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={DEVICE_COLORS[entry.name] || FALLBACK_COLORS[index % FALLBACK_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#0F172A",
              borderColor: "#334155",
              borderRadius: "8px",
              fontSize: "12px",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex gap-4 mt-2">
        {devices.map((d, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs text-gray-300">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{
                backgroundColor:
                  DEVICE_COLORS[d.name] || FALLBACK_COLORS[i % FALLBACK_COLORS.length],
              }}
            />
            <span>{d.name}: {d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HorizontalBarList({title, icon: Icon, items = [], labelKey, valueKey}) {
  if (!items || items.length === 0) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-gray-300">
            {Icon && <Icon className="h-4 w-4 text-blue-400" />}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-gray-500 py-6 text-center">No data available yet</div>
        </CardContent>
      </Card>
    );
  }

  const maxVal = Math.max(...items.map((it) => it[valueKey] || 1), 1);

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-gray-300">
          {Icon && <Icon className="h-4 w-4 text-blue-400" />}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item, idx) => {
          const percentage = Math.round(((item[valueKey] || 0) / maxVal) * 100);
          return (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-gray-300 truncate max-w-[180px]">
                  {item[labelKey] || "Unknown"}
                </span>
                <span className="text-gray-400">{item[valueKey]}</span>
              </div>
              <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{width: `${percentage}%`}}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export function RecentActivityStream({recentClicks = []}) {
  if (!recentClicks || recentClicks.length === 0) {
    return (
      <div className="text-center py-8 text-xs text-gray-500">
        No recent click activity recorded.
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-800">
      {recentClicks.map((click, idx) => (
        <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <span className="p-1.5 rounded-md bg-gray-800 text-gray-400">
              {click.device === "mobile" ? (
                <Smartphone className="h-3.5 w-3.5" />
              ) : (
                <Laptop className="h-3.5 w-3.5" />
              )}
            </span>
            <div>
              <div className="text-gray-200 font-medium">
                {click.city && click.city !== "Unknown" ? `${click.city}, ` : ""}
                {click.country || "Unknown Location"}
              </div>
              <div className="text-[11px] text-gray-500">
                {click.browser || "Browser"} on {click.os || "OS"} • via {click.referrer || "Direct"}
              </div>
            </div>
          </div>
          <span className="text-gray-400 text-[11px]">
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
    <div className="space-y-6">
      {/* Click Trend Over Time */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2 text-white">
            <Activity className="h-5 w-5 text-blue-400" />
            Click Velocity Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ClickTrendChart timeSeries={timeSeries} />
        </CardContent>
      </Card>

      {/* Grid of Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Device Breakdown */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-gray-300">
              <Smartphone className="h-4 w-4 text-blue-400" />
              Device Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DeviceDonutChart devices={devices} />
          </CardContent>
        </Card>

        {/* Top Browsers */}
        <HorizontalBarList
          title="Top Browsers"
          icon={Compass}
          items={browsers}
          labelKey="name"
          valueKey="count"
        />

        {/* Top Operating Systems */}
        <HorizontalBarList
          title="Operating Systems"
          icon={Laptop}
          items={operatingSystems}
          labelKey="name"
          valueKey="count"
        />

        {/* Top Referrers */}
        <HorizontalBarList
          title="Top Referrers"
          icon={ArrowUpRight}
          items={topReferrers}
          labelKey="source"
          valueKey="count"
        />
      </div>

      {/* Geo Locations & Live Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <HorizontalBarList
          title="Top Countries"
          icon={Globe2}
          items={topCountries}
          labelKey="country"
          valueKey="count"
        />

        <HorizontalBarList
          title="Top Cities"
          icon={Globe2}
          items={topCities}
          labelKey="city"
          valueKey="count"
        />

        {/* Live Click Stream */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-gray-300">
              <Activity className="h-4 w-4 text-emerald-400" />
              Recent Click Stream
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RecentActivityStream recentClicks={recentClicks} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
