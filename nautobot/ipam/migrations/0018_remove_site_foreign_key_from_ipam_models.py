# Generated by Django 3.2.16 on 2023-02-10 01:03

from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("dcim", "0036_remove_site_foreign_key_from_dcim_models"),
        ("ipam", "0017_prefix_remove_is_pool"),
    ]

    operations = [
        migrations.AlterModelOptions(
            name="vlan",
            options={
                "ordering": ("location", "vlan_group", "vid"),
                "verbose_name": "VLAN",
                "verbose_name_plural": "VLANs",
            },
        ),
        migrations.AlterModelOptions(
            name="vlangroup",
            options={
                "ordering": ("location", "name"),
                "verbose_name": "VLAN group",
                "verbose_name_plural": "VLAN groups",
            },
        ),
        migrations.RemoveField(
            model_name="prefix",
            name="site",
        ),
        migrations.RemoveField(
            model_name="vlan",
            name="site",
        ),
        migrations.AlterUniqueTogether(
            name="vlangroup",
            unique_together={("location", "name"), ("location", "slug")},
        ),
        migrations.RemoveField(
            model_name="vlangroup",
            name="site",
        ),
    ]
