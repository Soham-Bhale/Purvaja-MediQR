import pytest
import os
from backend.app.services.iac_analyzer import (
    parse_terraform_files,
    parse_cloudformation_files,
    analyze_iac_infrastructure
)


def test_parse_terraform_files(temp_repo_dir):
    tf_file = os.path.join(temp_repo_dir, "main.tf")
    with open(tf_file, "w", encoding="utf-8") as f:
        f.write('''provider "aws" {
  region = "us-west-2"
}

resource "aws_instance" "web_server" {
  instance_type = "t3.medium"
}
''')

    instances = parse_terraform_files(temp_repo_dir)
    assert len(instances) == 1
    assert instances[0]["name"] == "web_server"
    assert instances[0]["instance_type"] == "t3.medium"
    assert instances[0]["region"] == "us-west-2"


def test_parse_cloudformation_files(temp_repo_dir):
    cfn_file = os.path.join(temp_repo_dir, "template.json")
    with open(cfn_file, "w", encoding="utf-8") as f:
        f.write('''{
  "Resources": {
    "MyEC2Instance": {
      "Type": "AWS::EC2::Instance",
      "Properties": {
        "InstanceType": "m5.large"
      }
    }
  }
}''')

    instances = parse_cloudformation_files(temp_repo_dir)
    assert len(instances) == 1
    assert instances[0]["name"] == "MyEC2Instance"
    assert instances[0]["instance_type"] == "m5.large"


@pytest.mark.asyncio
async def test_analyze_iac_infrastructure(temp_repo_dir):
    tf_file = os.path.join(temp_repo_dir, "main.tf")
    with open(tf_file, "w", encoding="utf-8") as f:
        f.write('''resource "aws_instance" "app" {
  instance_type = "t4g.micro"
}
''')

    res = await analyze_iac_infrastructure(temp_repo_dir)
    assert res["num_instances"] == 1
    assert res["service_carbon"] > 0
    assert res["embodied_carbon"] > 0
    assert res["carbon"] > 0
