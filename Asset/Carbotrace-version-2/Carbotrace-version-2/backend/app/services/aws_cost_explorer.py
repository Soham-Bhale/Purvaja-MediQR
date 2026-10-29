import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
import boto3

from backend.app.config import settings
from backend.app.services.ccf_coefficients import get_instance_power, get_grid_intensity, AWS_PUE

logger = logging.getLogger(__name__)

HOURS_PER_MONTH = 730.0


def _fetch_aws_cost_data_sync() -> List[Dict[str, Any]]:
    """Synchronous call to AWS Cost Explorer API."""
    if not settings.AWS_ACCESS_KEY_ID or not settings.AWS_SECRET_ACCESS_KEY:
        logger.info("AWS credentials not configured. Skipping live Cost Explorer scan.")
        return []

    try:
        client = boto3.client(
            "ce",
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_DEFAULT_REGION
        )

        end_date = datetime.utcnow().strftime("%Y-%m-%d")
        start_date = (datetime.utcnow() - timedelta(days=30)).strftime("%Y-%m-%d")

        response = client.get_cost_and_usage(
            TimePeriod={"Start": start_date, "End": end_date},
            Granularity="MONTHLY",
            Metrics=["UsageQuantity", "UnblendedCost"],
            GroupBy=[
                {"Type": "DIMENSION", "Key": "SERVICE"},
                {"Type": "DIMENSION", "Key": "REGION"}
            ]
        )

        results = []
        for result_by_time in response.get("ResultsByTime", []):
            for group in result_by_time.get("Groups", []):
                keys = group.get("Keys", [])
                service_name = keys[0] if len(keys) > 0 else "Unknown"
                region_name = keys[1] if len(keys) > 1 else settings.AWS_DEFAULT_REGION

                metrics = group.get("Metrics", {})
                usage_qty = float(metrics.get("UsageQuantity", {}).get("Amount", 0.0))
                cost = float(metrics.get("UnblendedCost", {}).get("Amount", 0.0))

                results.append({
                    "service": service_name,
                    "region": region_name,
                    "usage_quantity": usage_qty,
                    "cost_usd": cost
                })

        return results
    except Exception as e:
        logger.error(f"Error fetching AWS Cost Explorer data: {e}")
        return []


async def analyze_aws_cost_explorer() -> Optional[Dict[str, Any]]:
    """Fetch live AWS service usage data and compute carbon footprint via CCF coefficients.

    Returns:
        Structured breakdown of live AWS infrastructure carbon emissions, or None if credentials missing.
    """
    if not settings.AWS_ACCESS_KEY_ID or not settings.AWS_SECRET_ACCESS_KEY:
        return None

    raw_data = await asyncio.to_thread(_fetch_aws_cost_data_sync)
    if not raw_data:
        return None

    total_service_carbon = 0.0
    total_kwh = 0.0
    services_breakdown = []

    for item in raw_data:
        service = item["service"]
        region = item["region"] or "us-east-1"
        usage_hours = item["usage_quantity"]
        cost = item["cost_usd"]

        # Estimate average active power draw based on service type
        if "Amazon Elastic Compute Cloud" in service or "EC2" in service:
            power_watts = get_instance_power("t3.medium")  # Average EC2 baseline power
        elif "Amazon Relational Database Service" in service or "RDS" in service:
            power_watts = get_instance_power("m5.large")
        else:
            power_watts = 15.0  # General cloud service baseline wattage

        # Calculate monthly kWh and carbon
        energy_kwh = (usage_hours or HOURS_PER_MONTH) * power_watts * AWS_PUE / 1000.0
        grid_intensity = get_grid_intensity(region)
        service_carbon = energy_kwh * grid_intensity

        total_kwh += energy_kwh
        total_service_carbon += service_carbon

        services_breakdown.append({
            "service": service,
            "region": region,
            "usage_hours": usage_hours,
            "cost_usd": cost,
            "energy_kwh": energy_kwh,
            "carbon": service_carbon
        })

    return {
        "num_services": len(services_breakdown),
        "total_kwh": total_kwh,
        "service_carbon": total_service_carbon,
        "services": services_breakdown,
        "carbon": total_service_carbon
    }
